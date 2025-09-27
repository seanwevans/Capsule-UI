const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('caps-modal handles open/close and focus management', async () => {
  const dom = new JSDOM('<!doctype html><html><body><button id="trigger">open</button></body></html>', { pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;
  global.Event = dom.window.Event;
  global.KeyboardEvent = dom.window.KeyboardEvent;

  await import('../packages/core/modal.js?test=open');
  await customElements.whenDefined('caps-modal');

  const trigger = document.getElementById('trigger');
  const el = document.createElement('caps-modal');
  document.body.appendChild(el);

  // open and focus modal host
  trigger.focus();
  el.setAttribute('open', '');
  assert.ok(el.hasAttribute('open'));
  assert.equal(document.activeElement, el);

  // remove open and restore focus
  el.removeAttribute('open');
  assert.ok(!el.hasAttribute('open'));
  assert.equal(document.activeElement, trigger);

  // reopen and close via Escape key
  trigger.focus();
  el.setAttribute('open', '');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  assert.ok(!el.hasAttribute('open'));
  assert.equal(document.activeElement, trigger);

  // reopen and close via backdrop click
  trigger.focus();
  el.setAttribute('open', '');
  el.shadowRoot.querySelector('.backdrop').click();
  assert.ok(!el.hasAttribute('open'));
  assert.equal(document.activeElement, trigger);
});

test('caps-modal traps focus within the modal when tabbing', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;
  global.Event = dom.window.Event;
  global.KeyboardEvent = dom.window.KeyboardEvent;

  await import('../packages/core/modal.js?test=trap');
  await customElements.whenDefined('caps-modal');

  const el = document.createElement('caps-modal');
  document.body.appendChild(el);

  const modal = el.shadowRoot.querySelector('.modal');
  const firstWrapper = document.createElement('div');
  firstWrapper.setAttribute('tabindex', '0');
  const firstInner = document.createElement('button');
  firstInner.textContent = 'First inner';
  firstWrapper.appendChild(firstInner);

  const middleButton = document.createElement('button');
  middleButton.textContent = 'Middle';

  const lastWrapper = document.createElement('div');
  lastWrapper.setAttribute('tabindex', '0');
  const lastInner = document.createElement('button');
  lastInner.textContent = 'Last inner';
  lastWrapper.appendChild(lastInner);

  modal.append(firstWrapper, middleButton, lastWrapper);

  el.setAttribute('open', '');

  // shift+tab from first descendant wraps to last focusable
  firstInner.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
  assert.equal(el.shadowRoot.activeElement, lastInner);

  // tab from last descendant wraps to first focusable
  lastInner.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
  assert.equal(el.shadowRoot.activeElement, firstWrapper);
});

test('caps-modal supports fullscreen variant', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;

  await import('../packages/core/modal.js?test=fullscreen');
  await customElements.whenDefined('caps-modal');

  const el = document.createElement('caps-modal');
  el.setAttribute('variant', 'fullscreen');
  document.body.appendChild(el);

  assert.equal(el.getAttribute('variant'), 'fullscreen');
});
