import {html, svg} from './zhtml.js';
import {humanReadableDate, browserLogoURL, browserLogo, commitURL, highlightANSIText} from './misc.js';
import {SortButton, ExpandButton, FilterConjunctionGroup, Popover} from './widgets.js';
import {cronjobBadgesHeader} from './cronjobs.js';
import {SMap} from './smap.js';
import {split} from './split.js';
import {highlightText, preloadHighlighter} from './codehighlight.js';

const MIDDLE_DOT = '·';

const COLOR_YELLOW = '#ffcc80';
const COLOR_GREEN = '#a5d6a7';
const COLOR_RED = '#ef9a9a';
const COLOR_VIOLET = '#ce93d8';
const COLOR_GREY = '#eeeeee';
const STYLE_FILL = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0;';

export async function fetchFlakiness() {
  // return fetch('https://folioflakinessdashboard.blob.core.windows.net/dashboards/main_v2.json').then(r => r.json()).then(data => {
  return fetch('/main_v2_filtered.json').then(r => r.json()).then(data => {
    //TODO: default data should filter out tests that are SKIP-only.
    // Since we don't do it up there, we filter it on our side.
    for (const spec of data.specs) {
      // Filter out tests that were skipped.
      spec.problematicTests = spec.problematicTests.filter(({sha, test}) => test.annotations.length !== 1 || test.annotations[0].type !== 'skip');
      // Filter out tests that have a single run without status: they didn't run because they were sharded away.
      spec.problematicTests = spec.problematicTests.filter(({sha, test}) => test.runs.length !== 1 || !!test.runs[0].status);
    }
    data.specs = data.specs.filter(spec => spec.problematicTests.length);
    return data;
  });
}

const cronjobsHeader = cronjobBadgesHeader();

const popover = new Popover(document);
document.documentElement.addEventListener('click', () => popover.hide(), false);

export async function renderFlakiness() {
  const data = await fetchFlakiness();
  const dashboard = new FlakinessDashboard(data);
  return dashboard.element;
}

class FlakinessDashboard {
  constructor(data) {
    console.time('Parsing data');

    this._fileContentsCache = new Map();

    this._selectedCommit = null;

    // All commits are sorted from newest to oldest.
    this._commits = new SMap(data.commits.map(({author, email, message, sha, timestamp}) => ({
      author,
      email,
      message,
      sha,
      //TODO: convert timestamp to number upstream.
      timestamp: +timestamp,
    })).sort((c1, c2) => c2.timestamp - c1.timestamp));

    // All specs are sorted by filename/line/column location.
    this._specs = new SMap(data.specs.map(({file, specId, title, commitCoordinates}) => {
      commitCoordinates = commitCoordinates.map(({line, column, sha}) => ({
        line,
        column,
        sha,
        commit: this._commits.get({sha}),
      }));
      const lastCoordinate = commitCoordinates.reduce((last, coord) => last.commit.timestamp < coord.commit.timestamp ? coord : last);
      return {
        specId,
        file,
        title,
        lastCoordinate,
        commitCoordinates: new SMap(commitCoordinates),
      };
    }).sort((s1, s2) => {
      if (s1.file !== s2.file)
        return s1.file < s2.file ? -1 : 1;
      return s1.lastCoordinate.line - s2.lastCoordinate.line || s1.lastCoordinate.column - s2.lastCoordinate.column;
    }));

    let tests = [];
    for (const {specId, problematicTests} of data.specs) {
      for (const {sha, test} of problematicTests) {
        tests.push({
          sha,
          commit: this._commits.get({sha}),
          specId,
          spec: this._specs.get({specId}),
          name: getTestName(test),
          browserName: test.parameters.browserName,
          platform: test.parameters.platform,
          parameters: test.parameters,
          annotations: test.annotations,
          runs: test.runs,
          expectedStatus: test.expectedStatus,
          category: getTestCategory(test),
        });
      }
    }
    this._tests = new SMap(tests);

    console.timeEnd('Parsing data');
    console.log(`commits: ${this._commits.size}`);
    console.log(`specs: ${this._specs.size}`);
    console.log(`tests: ${this._tests.size}`);

    this._mainElement = html`<section style="overflow: auto;${STYLE_FILL}"></section>`;
    this._sideElement = html`<section style="padding: 1em; overflow: auto;${STYLE_FILL}"></section>`;
    this._codeElement = html`<vbox style="${STYLE_FILL}"></vbox>`;

    this._splitView = split.bottom({
      main: this._mainElement,
      sidebar: html`
        ${split.right({
          main: this._sideElement,
          sidebar: this._codeElement,
          hidden: false,
          size: 700,
        })}
        <button style="position: absolute;
                       right: -5px;
                       top: 0;
                       appearance: none;
                       background: white;
                       border: 5px solid var(--border-color);
                       cursor: pointer;
                       transform: translate(0, -100%);
                       z-index: 10000;"
                onclick=${e => split.hideSidebar(this._splitView)}>✖ close</button>
      `,
      size: 300,
      hidden: true,
    });

    this.element = this._splitView;

    this._lastCommits = 20;
    this._lastCommitsSelect = html`
      <div>
        Show Last <select oninput=${e => {
          this._lastCommits = parseInt(e.target.value, 10);
          this._render();
        }}>
          ${[...Array(8)].map((_, index) => html`
            <option>${index + 2}</option>
          `)}
          <option>10</option>
          <option>15</option>
          <option selected>20</option>
          <option>30</option>
          <option>50</option>
        </select> Commits
      </div>
    `;
    /*
    this._filterGroup = new FilterConjunctionGroup(this._allParameters);
    this._filterGroup.events.onchange(() => this._render());
    */

    this._render();
  }

  _render() {
    const self = this;

    console.time('filtering');

    const commits = new SMap(this._commits.slice(0, this._lastCommits));
    const tests = new SMap(this._tests.filter(test => commits.has({sha: test.sha})));
    const specs = new SMap(this._specs.filter(spec => tests.has({specId: spec.specId})));

    const filenames = specs.uniqueValues('file');
    console.timeEnd('filtering');

    console.time('rendering');
    this._mainElement.textContent = '';
    this._mainElement.append(html`
      ${cronjobsHeader}
      <div style="padding: 1em;">
        ${this._lastCommitsSelect}
        ${filenames.map(filename => html`
          <div>${filename}</div>
          ${specs.getAll({file: filename}).map(spec => html`
            <hbox style="margin-left:1em;">
              ${renderSpecTitle(spec)}
              ${renderSpecAnnotations(spec)}
              ${commits.map(commit => renderSpecCommit(spec, commit))}
            </hbox>
          `)}
        `)}
      </div>
    `);
    console.timeEnd('rendering');

    function renderSpecTitle(spec) {
      return html`
        <div style="
          width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">${spec.lastCoordinate.line}:${spec.title}</div>
      `;
    }

    function renderSpecAnnotations(spec) {
      const annotations = tests.getAll({specId: spec.specId, sha: spec.lastCoordinate.commit.sha}).map(test => test.annotations).flat();
      const types = new SMap(annotations).uniqueValues('type').sort();
      return html`
        <div style="
          width: 120px;
        ">
          ${types.map(renderAnnotation)}
        </div>
      `;
    }

    function renderAnnotation(annotationType) {
      const bgcolors = {
        'slow': 'grey',
        'flaky': COLOR_VIOLET,
        'fail': COLOR_RED,
        'fixme': 'black',
        'skip': COLOR_YELLOW,
      };
      const colors = {
        'skip': 'black',
        'fail': 'black',
      };
      return html`
        <span style="
            background-color: ${bgcolors[annotationType] || 'blue'};
            color: ${colors[annotationType] || 'white'};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;
            font-size: 8px;
            margin: 0 2px;
            width: 5ch;
            box-sizing: content-box;
            text-align: center;
            flex: none;
          ">${annotationType}</span>
      `;
    }

    function renderSpecCommit(spec, commit) {
      const categories = new Set(tests.getAll({specId: spec.specId, sha: commit.sha}).map(test => test.category));
      let color = COLOR_GREY;
      if (categories.has('bad'))
        color = COLOR_RED;
      else if (categories.has('flaky'))
        color = COLOR_VIOLET;
      else if (categories.size || spec.commitCoordinates.has({sha: commit.sha}))
        color = COLOR_GREEN;

      return svg`
        <svg style="flex: none; margin: 1px; " width="14px" height="14px"
             onclick=${event => renderSidebarSpecCommit.call(self, spec, commit)}
             viewbox="0 0 14 14">
          <rect x=0 y=0 width=14 height=14 fill="${color}"/>
        </svg>
      `;
    }

    function renderSidebarSpecCommit(spec, commit) {
      renderCode.call(self, commit, spec);
      this._sideElement.textContent = '';
      const runColors = {
        'passed': COLOR_GREEN,
        'failed': COLOR_RED,
        'timedOut': COLOR_YELLOW,
        'skipped': COLOR_GREY,
      };
      this._sideElement.append(html`
        <vbox>
          <div style="margin-bottom: 1em;">
            <a href="${commitURL('playwright', commit.sha)}" class=sha>${commit.sha.substring(0, 7)}</a> ${commit.message}
          </div>
          <hbox>
            <div style="margin-left: 1em; width: 320px; text-align: center;">test parameters</div>
            <div style="width: 100px; text-align: center;">runs</div>
            <div style="width: 100px; text-align: center;">expected</div>
          </hbox>
          ${tests.getAll({sha: commit.sha, specId: spec.specId}).map(test => html`
            <hbox>
              <div style="
                width: 200px;
                margin-left: 1em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              ">${test.name}</div>
              <div style="width: 120px;">${test.annotations.map(a => renderAnnotation(a.type))}</div>
              <div style="width: 100px; text-align: center;">
                ${test.runs.map(run => svg`
                  <svg style="margin: 1px;" width=10 height=10 viewbox="0 0 10 10">
                    <circle cx=5 cy=5 r=5 fill="${runColors[run.status] || 'blue'}">
                  </svg>
                `)}
              </div>
              <div style="width: 100px; text-align: center;">
                ${svg`
                  <svg style="margin: 1px;" width=10 height=10 viewbox="0 0 10 10">
                    <circle cx=5 cy=5 r=5 fill="${runColors[test.expectedStatus] || 'blue'}">
                  </svg>
                `}
              </div>
            </hbox>
          `)}
        </vbox>
      `);
      split.showSidebar(this._splitView);
    }

    function renderCode(commit, spec) {
      this._codeElement.textContent = '';

      const editorElement = html`<section></section>`;
      this._codeElement.append(html`
        <div>
          <span style="
            margin: 0px 4px -2px 0px;
            padding: 2px 10px;
            display: inline-block;
            background-color: var(--border-color);
          ">${spec.file}</span>
        </div>
        ${editorElement}
      `);

      const loadingElement = html`<div></div>`;
      setTimeout(() => loadingElement.textContent = 'Loading...', 777);
      editorElement.append(loadingElement);

      const cacheKey = JSON.stringify({sha: commit.sha, file: spec.file});
      let textPromise = this._fileContentsCache.get(cacheKey);
      if (!textPromise) {
        textPromise = fetch(`https://raw.githubusercontent.com/microsoft/playwright/${commit.sha}/test/${spec.file}`).then(r => r.text());
        this._fileContentsCache.set(cacheKey, textPromise);
      }

      preloadHighlighter('text/typescript');

      textPromise.then(async text => {
        const lines = await highlightText(text, 'text/typescript');
        const digits = (lines.length + '').length;
        const coords = spec.commitCoordinates.get({sha: commit.sha}) || {line: -1};
        const STYLE_SELECTED = 'background-color: #fff9c4;';
        const gutter = html`
          <div>
          <div style="padding: 0 1em 0 1em; text-align: right; border-right: 1px solid ${COLOR_GREY}">
            ${lines.map((line, index) => html`<div x-line-number=${index + 1}>${index + 1}</div>`)}
          </div>
          </div>
        `;
        const code = html`
          <div style="flex: auto">
          <div>
          ${lines.map((line, index) => html`
            <div style="
              display: flex;
              ${index + 1 === coords.line ? STYLE_SELECTED : ''}
            ">
              ${line.length ? line.map(({tokenText, className}) => html`<span class=${className ? 'cm-js-' + className : undefined}>${tokenText}</span>`) : html`<span> </span>`}
            </div>
          `)}
          </div>
          </div>
        `;
        editorElement.replaceWith(html`
          <div style="display: flex;
                      white-space: pre;
                      overflow: auto;
                      font-family: var(--monospace);
                      border-top: 1px solid var(--border-color);
          ">
            ${gutter}
            ${code}
          </div>
        `);
        gutter.$(`[x-line-number="${coords.line}"]`)?.scrollIntoView({block: 'center'});
      });
    }
  }
}

function isHealthyTest(test) {
  if (test.runs.length !== 1)
    return false;
  const run = test.runs[0];
  return !run.status || run.status === 'skipped' || run.status === 'passed';
}

function getTestsSummary(tests) {
  const allRuns = [];
  for (const test of tests)
    allRuns.push(...test.runs);
  const runs = allRuns.filter(run => run.status && run.status !== 'skipped');
  return [...new Set(runs.map(run => run.status))];
}

function isFlakyTest(test) {
  if (test.runs.length === 1)
    return false;
  if (!test.annotations.some(annotation => annotation.type === 'flaky'))
    return false;
  return test.runs.some(run => run.status === test.expectedStatus);
}

function getTestCategory(test) {
  const hasGoodRun = test.runs.some(run => run.status === test.expectedStatus);
  const hasBadRun = test.runs.some(run => run.status !== test.expectedStatus && run.status !== 'skipped');
  const hasFlakyAnnotation = test.annotations.some(annotation => annotation.type === 'flaky');
  if (hasFlakyAnnotation && hasGoodRun && hasBadRun)
    return 'flaky';
  if (hasBadRun)
    return 'bad';
  return 'good';
}

function getTestName(test) {
  return Object.entries(test.parameters).filter(([key, value]) => !!value).map(([key, value]) => {
    if (typeof value === 'string')
      return value;
    if (typeof value === 'boolean')
      return key;
    return `${key}=${value}`;
  }).join(' / ');
}
