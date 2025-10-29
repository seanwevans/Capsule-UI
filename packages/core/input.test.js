import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

function withDom(t, html = '<!doctype html><html><body></body></html>') {
  const dom = new JSDOM(html, { url: 'http://localhost', pretendToBeVisual: true });
  const { window } = dom;
  const previousGlobals = new Map();
  const globals = {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    customElements: window.customElements,
    FormData: window.FormData,
    Event: window.Event,
    ShadowRoot: window.ShadowRoot
  };

  for (const [key, value] of Object.entries(globals)) {
    previousGlobals.set(key, globalThis[key]);
    globalThis[key] = value;
  }

  t.after(() => {
    dom.window.close();
    for (const [key, value] of previousGlobals) {
      if (value === undefined) {
        delete globalThis[key];
      } else {
        globalThis[key] = value;
      }
    }
  });

  return window;
}

test('caps-input synchronizes user input with form submissions', async (t) => {
  const window = withDom(t);
  await import('./input.js');

  const form = window.document.createElement('form');
  const capsInput = window.document.createElement('caps-input');
  capsInput.name = 'username';

  form.append(capsInput);
  window.document.body.append(form);

  const innerInput = capsInput.shadowRoot.querySelector('input');
  innerInput.value = 'hello world';
  innerInput.dispatchEvent(new window.Event('input', { bubbles: true, composed: true }));

  assert.equal(capsInput.value, 'hello world');
  assert.equal(capsInput.getAttribute('value'), null);

  const formData = new window.FormData(form);
  assert.equal(formData.get('username'), 'hello world');

  innerInput.value = '';
  innerInput.dispatchEvent(new window.Event('change', { bubbles: true, composed: true }));

  assert.equal(capsInput.value, '');
  assert.equal(capsInput.hasAttribute('value'), false);

  const resetData = new window.FormData(form);
  assert.equal(resetData.get('username'), '');
});
