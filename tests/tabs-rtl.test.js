const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

function key(el, key, win) {
  el.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true }));
}

test('caps-tabs arrow key navigation flips in RTL', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.customElements = dom.window.customElements;
  global.CustomEvent = dom.window.CustomEvent;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;

  const locale = await import('../packages/core/locale.js');
  await import('../packages/core/tabs.js');

  const tabs = document.createElement('caps-tabs');
  const t1 = document.createElement('button');
  t1.setAttribute('slot', 'tab');
  t1.textContent = 'One';
  const t2 = document.createElement('button');
  t2.setAttribute('slot', 'tab');
  t2.textContent = 'Two';
  const p1 = document.createElement('div');
  p1.setAttribute('slot', 'panel');
  p1.textContent = 'A';
  const p2 = document.createElement('div');
  p2.setAttribute('slot', 'panel');
  p2.textContent = 'B';
  tabs.append(t1, t2, p1, p2);
  document.body.appendChild(tabs);

  // LTR: ArrowRight moves from first to second tab
  key(t1, 'ArrowRight', dom.window);
  assert.equal(t2.getAttribute('aria-selected'), 'true');

  // RTL: ArrowRight moves from second back to first
  locale.setLocale({ dir: 'rtl' });
  await new Promise((r) => setTimeout(r, 0));
  key(t2, 'ArrowRight', dom.window);
  assert.equal(t1.getAttribute('aria-selected'), 'true');
});
