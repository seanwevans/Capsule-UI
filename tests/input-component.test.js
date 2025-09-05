const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('caps-input reflects value between property and attribute', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;

  await import('../packages/core/input.js');

  const el = document.createElement('caps-input');
  document.body.appendChild(el);

  el.value = 'hello';
  assert.equal(el.getAttribute('value'), 'hello');
  assert.equal(el.shadowRoot.querySelector('input').value, 'hello');

  el.setAttribute('value', 'world');
  assert.equal(el.value, 'world');
  assert.equal(el.shadowRoot.querySelector('input').value, 'world');

  el.value = '';
  assert.equal(el.hasAttribute('value'), false);
  assert.equal(el.shadowRoot.querySelector('input').value, '');
});
