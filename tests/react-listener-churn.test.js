const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { act } = require('react-dom/test-utils');

test('listeners only update when handler changes', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;

  await import('../packages/core/button.js');
  const fs = require('fs');
  const path = require('path');
  const tmp = path.join(__dirname, 'react-index.mjs');
  const code = fs
    .readFileSync(path.join(__dirname, '../packages/react/index.js'), 'utf8')
    .replace("import '@capsule-ui/core';", '');
  fs.writeFileSync(tmp, code);
  const { CapsButton } = await import(tmp);
  fs.unlinkSync(tmp);

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  const handler1 = () => {};
  let addCount = 0;
  let removeCount = 0;
  const origAdd = window.HTMLElement.prototype.addEventListener;
  const origRemove = window.HTMLElement.prototype.removeEventListener;
  window.HTMLElement.prototype.addEventListener = function(type, listener, options) {
    if (this.tagName === 'CAPS-BUTTON') addCount++;
    return origAdd.call(this, type, listener, options);
  };
  window.HTMLElement.prototype.removeEventListener = function(type, listener, options) {
    if (this.tagName === 'CAPS-BUTTON') removeCount++;
    return origRemove.call(this, type, listener, options);
  };

  await act(async () => {
    root.render(React.createElement(CapsButton, { onClick: handler1, label: 'a' }));
  });
  assert.equal(addCount, 1);
  assert.equal(removeCount, 0);

  // Change non-event prop only
  await act(async () => {
    root.render(React.createElement(CapsButton, { onClick: handler1, label: 'b' }));
  });
  assert.equal(addCount, 1);
  assert.equal(removeCount, 0);

  // Change event handler
  const handler2 = () => {};
  await act(async () => {
    root.render(React.createElement(CapsButton, { onClick: handler2, label: 'b' }));
  });
  assert.equal(addCount, 2);
  assert.equal(removeCount, 1);
  root.unmount();
  window.HTMLElement.prototype.addEventListener = origAdd;
  window.HTMLElement.prototype.removeEventListener = origRemove;
});
