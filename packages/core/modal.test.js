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
    KeyboardEvent: window.KeyboardEvent,
    ShadowRoot: window.ShadowRoot,
    Node: window.Node
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

test('caps-modal ignores keyboard handler when closed', async (t) => {
  const window = withDom(t);
  await import('./modal.js');

  const modal = window.document.createElement('caps-modal');
  window.document.body.append(modal);

  let removeCalls = 0;
  const originalRemoveAttribute = modal.removeAttribute.bind(modal);
  modal.removeAttribute = (name) => {
    removeCalls += 1;
    return originalRemoveAttribute(name);
  };

  modal._onKeyDown(new window.KeyboardEvent('keydown', { key: 'Escape' }));

  assert.equal(removeCalls, 0);
  assert.equal(modal.hasAttribute('open'), false);
});

test('escape keydown on document does not mutate closed modal state', async (t) => {
  const window = withDom(t);
  await import('./modal.js');

  const modal = window.document.createElement('caps-modal');
  window.document.body.append(modal);

  assert.equal(modal.hasAttribute('open'), false);

  let removeCalls = 0;
  const originalRemoveAttribute = modal.removeAttribute.bind(modal);
  modal.removeAttribute = (name) => {
    removeCalls += 1;
    return originalRemoveAttribute(name);
  };

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  assert.equal(removeCalls, 0);
  assert.equal(modal.hasAttribute('open'), false);
});
