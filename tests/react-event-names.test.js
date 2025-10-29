const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const fs = require('fs');
const path = require('path');

const loadReactBundle = async () => {
  const tmp = path.join(__dirname, 'react-index-events.mjs');
  const code = fs
    .readFileSync(path.join(__dirname, '../packages/react/index.js'), 'utf8')
    .replace("import '@capsule-ui/core';", '');
  fs.writeFileSync(tmp, code);
  try {
    return await import(tmp);
  } finally {
    fs.unlinkSync(tmp);
  }
};

test('React adapter maps camelCase custom events to kebab-case', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;

  await import('../packages/core/input.js');
  const { CapsInput } = await loadReactBundle();

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  let capsReceived = null;
  const handleCapsChange = (event) => {
    capsReceived = event.type;
  };
  let clickReceived = null;
  const handleClick = (event) => {
    clickReceived = event.type;
  };
  let pointerReceived = null;
  const handlePointerDown = (event) => {
    pointerReceived = event.type;
  };

  await act(async () => {
    root.render(
      React.createElement(CapsInput, {
        onCapsChange: handleCapsChange,
        onClick: handleClick,
        onPointerDown: handlePointerDown,
        label: 'Capsule'
      })
    );
  });

  const element = container.querySelector('caps-input');
  assert.ok(element, 'caps-input should be rendered');

  element.dispatchEvent(new CustomEvent('caps-change', { bubbles: true }));
  assert.equal(capsReceived, 'caps-change');

  element.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  assert.equal(clickReceived, 'click');

  element.dispatchEvent(new dom.window.Event('pointerdown', { bubbles: true }));
  assert.equal(pointerReceived, 'pointerdown');

  root.unmount();
  delete global.window;
  delete global.document;
  delete global.HTMLElement;
  delete global.customElements;
  delete global.CustomEvent;
});
