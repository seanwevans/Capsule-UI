const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('caps-card supports variant and size attributes', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;

  await import('../packages/core/card.js');

  const el = document.createElement('caps-card');
  document.body.appendChild(el);

  el.setAttribute('variant', 'ghost');
  el.setAttribute('size', 'compact');
  assert.equal(el.getAttribute('variant'), 'ghost');
  assert.equal(el.getAttribute('size'), 'compact');
});
