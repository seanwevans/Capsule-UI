const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('components update dir when locale changes', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;

  const locale = await import('../packages/core/locale.js');
  await import('../packages/core/button.js');

  const el = document.createElement('caps-button');
  document.body.appendChild(el);
  assert.equal(el.getAttribute('dir'), 'ltr');

  locale.setLocale({ dir: 'rtl' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(el.getAttribute('dir'), 'rtl');

  const el2 = document.createElement('caps-button');
  el2.setAttribute('dir', 'ltr');
  document.body.appendChild(el2);
  locale.setLocale({ dir: 'rtl' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(el2.getAttribute('dir'), 'ltr');
});
