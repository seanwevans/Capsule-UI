const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('caps-select reflects value and disabled', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;

  await import('../packages/core/select.js');

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('value', 'b');
  assert.equal(el.value, 'b');
  assert.equal(el.shadowRoot.querySelector('select').value, 'b');

  el.disabled = true;
  assert.equal(el.shadowRoot.querySelector('select').disabled, true);
});
