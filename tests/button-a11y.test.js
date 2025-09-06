const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('caps-button forwards aria attributes', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;

  await import('../packages/core/button.js');

  const el = document.createElement('caps-button');
  el.setAttribute('aria-label', 'save');
  el.disabled = true;
  document.body.appendChild(el);

  const internal = el.shadowRoot.querySelector('button');
  assert.equal(internal.getAttribute('aria-label'), 'save');
  assert.equal(internal.getAttribute('aria-disabled'), 'true');
});
