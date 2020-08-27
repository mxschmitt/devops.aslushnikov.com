import {html} from './zhtml.js';
import {humanReadableSize, commitURL} from './misc.js';

export function fetchDockerStats() {
  return fetch('https://raw.githubusercontent.com/aslushnikov/devops.aslushnikov.com/docker-image-size-data/data.json').then(r => r.json()).then(json => {
    json.infos.sort((a, b) => b.timestamp - a.timestamp);
    return json;
  });
}

export function dockerSizeStats(dockerData, preview = false) {
  const originalData = dockerData.infos;
  let data = dockerData.infos;
  let footer;
  if (preview) {
    const RECENT_RUNS = 5;
    data = data.slice(0, RECENT_RUNS);
    footer = html`
      <footer>
        Showing ${RECENT_RUNS} most recent commits. <a href="/full-docker-stats.html">See all</a>
      </footer>
    `;
  }
  return html`
    <section class=docker-size>
      <header>
        <hbox>
          <h2>Dockerfile.bionic image size</h2>
          <spacer></spacer>
          <h2>raw: ${humanReadableSize(data[0].rawSize)} zip: ${humanReadableSize(data[0].zipSize)}</h2>
        </hbox>
        <div>(updates daily at 4AM PST)</div>
      </header>
      <section>
        ${data.map((d, index) => renderRow(d, index))}
      </section>
      ${footer}
    </section>
  `;

  function renderRow(d, index) {
    const rawDelta = index + 1 < originalData.length ? d.rawSize - originalData[index + 1].rawSize : d.rawSize;
    const zipDelta = index + 1 < originalData.length ? d.zipSize - originalData[index + 1].zipSize : d.zipSize;
    return html`
      <hbox class=row>
        <span>
          <a class=sha href="${commitURL('playwright', d.sha)}">${d.sha.substring(0, 7)}</a>
        </span>
        <span class=message>${d.message}</span>
        <spacer></spacer>
        ${renderBytesDelta('raw:', rawDelta)}
        ${renderBytesDelta('zip:', zipDelta)}
      </hbox>
    `;
  }

  function renderBytesDelta(preffix, delta) {
    const cls = delta < 0 ? 'size-decrease' : 'size-increase';
    const sign = delta < 0 ? '': '+';
    return html`<span class="size-delta ${cls}">${preffix} ${sign}${humanReadableSize(delta)}</span>`;
  }
}

