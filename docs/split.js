import {html} from './zhtml.js';
import {onDOMEvent, disposeAll, consumeDOMEvent} from './utils.js';

const sidebarPositionToCSSClass = {
  'left': 'sidebar-left',
  'right': 'sidebar-right',
  'top': 'sidebar-top',
  'bottom': 'sidebar-bottom',
};

const sidebarPositionToCSSOrientation = {
  'left': 'horizontal',
  'right': 'horizontal',
  'top': 'vertical',
  'bottom': 'vertical',
};

export const split = {
  left: ({sidebar, main, size, hidden = false }) => splitElement(sidebar, main, size, hidden, 'left' ),
  right: ({sidebar, main, size, hidden = false }) => splitElement(sidebar, main, size, hidden, 'right'),
  top: ({sidebar, main, size, hidden = false }) => splitElement(sidebar, main, size, hidden, 'top'),
  bottom: ({sidebar, main, size, hidden = false }) => splitElement(sidebar, main, size, hidden, 'bottom'),
  hideSidebar: (splitElement) => splitElement.removeAttribute('sidebar-shown'),
  showSidebar: (splitElement) => splitElement.setAttribute('sidebar-shown', true),
  toggleExpand: (splitElement) => toggleExpand(splitElement),
  isSidebarShown: (splitElement) => splitElement.hasAttribute('sidebar-shown'),
  registerResizer: (splitElement, resizerElement) => registerResizer(splitElement, resizerElement),
};

const MetaInfoSymbol = Symbol('Split.Meta');

function splitElement(sidebar, main, size, hidden, sidebarPosition) {
  const mainPane = html`<main-pane>${main}</main-pane>`;
  const resizer = html`<split-resizer></split-resizer>`;
  const sideElement = html`<side-pane>${sidebar}</side-pane>`;
  const element = html`
    <split-element class="${sidebarPositionToCSSClass[sidebarPosition]} ${sidebarPositionToCSSOrientation[sidebarPosition]}">
      ${sideElement}
      ${resizer}
      ${mainPane}
    </split-element>
  `;
  if (!hidden)
    element.setAttribute('sidebar-shown', true);

  sideElement.style.setProperty('--size', size);
  element[MetaInfoSymbol] = {
    sideElement,
    sidebarPosition,
    size,
  };
  registerResizer(element, resizer);
  return element;
}

function toggleExpand(splitElement) {
  const info = splitElement[MetaInfoSymbol];
  if (!info)
    throw new Error('ERROR: given element is not a splitElement');
  const propertyName = info.sidebarPosition === 'left' || info.sidebarPosition === 'right' ? 'width' : 'height';
  const dimensionName = info.sidebarPosition === 'left' || info.sidebarPosition === 'right' ? 'offsetWidth' : 'offsetHeight';
  if (info.oldSize === undefined) {
    info.sideElement.style.removeProperty('--size');
    info.sideElement.style.setProperty(propertyName, '100%');
    info.oldSize = info.size;
    //TODO: 5px comes from resizer size. We should merge split.css in here.
    info.size = info.sideElement[dimensionName] - 5;
    info.sideElement.style.setProperty('--size', info.size);
    info.sideElement.style.removeProperty(propertyName);
  } else {
    info.size = info.oldSize;
    info.sideElement.style.setProperty('--size', info.size);
    info.oldSize = undefined;
  }
}

function registerResizer(splitElement, resizerElement) {
  const info = splitElement[MetaInfoSymbol];
  if (!info)
    throw new Error('ERROR: given element is not a splitElement');
  const domEvents = [];
  const axis = info.sidebarPosition === 'left' || info.sidebarPosition === 'right' ? 'pageX' : 'pageY';
  const coeff = info.sidebarPosition === 'bottom' || info.sidebarPosition === 'right' ? -1 : 1;
  let initialCoordinate = 0;

  const initialize = event => {
    consumeDOMEvent(event);
    disposeAll(domEvents);
    initialCoordinate = event[axis];
    domEvents.push(
      onDOMEvent(document, 'mousemove', event => update(event, false /* commit */)),
      onDOMEvent(document, 'mouseup', event => update(event, true /* commit */)),
      onDOMEvent(document, 'mouseleave', event => update(event, true /* commit */)),
    );
  };

  const update = (event, commit) => {
    consumeDOMEvent(event);
    const delta = (event[axis] - initialCoordinate) * coeff;
    info.sideElement.style.setProperty('--size', (info.size + delta) + 'px');
    if (!commit)
      return;

    if (delta) {
      info.size += delta;
      info.oldSize = undefined;
    }
    disposeAll(domEvents);
    domEvents.push(onDOMEvent(resizerElement, 'mousedown', initialize));
  };

  domEvents.push(onDOMEvent(resizerElement, 'mousedown', initialize));
}

