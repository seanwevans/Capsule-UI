const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { act } = require('react-dom/test-utils');

const loadReactComponents = async () => {
  await import('../packages/core/button.js');
  const fs = require('fs');
  const path = require('path');
  const tmp = path.join(__dirname, 'react-index.mjs');
  const code = fs
    .readFileSync(path.join(__dirname, '../packages/react/index.js'), 'utf8')
    .replace("import '@capsule-ui/core';", '');
  fs.writeFileSync(tmp, code);
  const mod = await import(tmp);
  fs.unlinkSync(tmp);
  return mod;
};

test('camel-cased custom events dispatch through React props', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.CustomEvent = dom.window.CustomEvent;
  global.customElements = dom.window.customElements;

  const { CapsButton } = await loadReactComponents();

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  let camelCalled = 0;
  const camelHandler = () => {
    camelCalled++;
  };

  let punctuationCalled = 0;
  const punctuationHandler = () => {
    punctuationCalled++;
  };

  await act(async () => {
    root.render(
      React.createElement(
        CapsButton,
        {
          onCapsuleToggle: camelHandler,
          ['onCapsule:toggle']: punctuationHandler
        },
        'Toggle'
      )
    );
  });

  const el = container.querySelector('caps-button');
  el.dispatchEvent(new CustomEvent('capsuleToggle', { bubbles: true }));
  assert.equal(camelCalled, 1);
  assert.equal(punctuationCalled, 0);

  el.dispatchEvent(new CustomEvent('capsule:toggle', { bubbles: true }));
  assert.equal(punctuationCalled, 1);

  root.unmount();
  delete global.window;
  delete global.document;
  delete global.HTMLElement;
  delete global.CustomEvent;
  delete global.customElements;
});
