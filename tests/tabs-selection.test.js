const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

let envPromise;

async function setup() {
  if (!envPromise) {
    envPromise = (async () => {
      const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        pretendToBeVisual: true,
      });
      global.window = dom.window;
      global.document = dom.window.document;
      global.HTMLElement = dom.window.HTMLElement;
      global.customElements = dom.window.customElements;
      global.CustomEvent = dom.window.CustomEvent;
      global.Node = dom.window.Node;
      global.Element = dom.window.Element;

      const locale = await import('../packages/core/locale.js');
      const { CapsTabs } = await import('../packages/core/tabs.js');
      if (!customElements.get('caps-tabs')) {
        customElements.define('caps-tabs', CapsTabs);
      }
      return { dom, locale };
    })();
  }
  const env = await envPromise;
  document.body.innerHTML = '';
  env.locale.setLocale({ dir: 'ltr' });
  return env;
}

test('caps-tabs keeps active tab when locale direction changes', async () => {
  const { locale } = await setup();
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

  t2.click();
  assert.equal(t2.getAttribute('aria-selected'), 'true');
  assert.equal(p2.hasAttribute('data-active'), true);

  locale.setLocale({ dir: 'rtl' });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(t2.getAttribute('aria-selected'), 'true');
  assert.equal(p2.hasAttribute('data-active'), true);
});

test('caps-tabs keeps active tab when slots mutate', async () => {
  await setup();
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

  t2.click();
  assert.equal(t2.getAttribute('aria-selected'), 'true');
  assert.equal(p2.hasAttribute('data-active'), true);

  const t3 = document.createElement('button');
  t3.setAttribute('slot', 'tab');
  t3.textContent = 'Three';
  const p3 = document.createElement('div');
  p3.setAttribute('slot', 'panel');
  p3.textContent = 'C';
  tabs.append(t3, p3);

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(t2.getAttribute('aria-selected'), 'true');
  assert.equal(p2.hasAttribute('data-active'), true);
  assert.equal(t3.getAttribute('aria-selected'), 'false');
  assert.equal(p3.hasAttribute('data-active'), false);
});
