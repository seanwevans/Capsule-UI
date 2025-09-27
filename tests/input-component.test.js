const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');

let importCounter = 0;
async function loadInputModule() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '../packages/core/input.js'));
  moduleUrl.searchParams.set('test', `${importCounter++}`);
  return import(moduleUrl.href);
}

test('caps-input reflects value between property and attribute', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;

  await loadInputModule();

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

test('caps-input forwards name attribute for form submissions', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;
  global.FormData = dom.window.FormData;

  await loadInputModule();

  const form = document.createElement('form');
  const el = document.createElement('caps-input');
  el.name = 'email';
  form.appendChild(el);
  document.body.appendChild(form);

  el.value = 'user@example.com';

  const data = new FormData(form);
  assert.equal(data.get('email'), 'user@example.com');
});
