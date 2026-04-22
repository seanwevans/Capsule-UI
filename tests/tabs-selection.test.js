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


test('caps-tabs generates unique panel ids per instance and links tabs correctly', async () => {
  await setup();

  const tabsA = document.createElement('caps-tabs');
  const aTab1 = document.createElement('button');
  aTab1.setAttribute('slot', 'tab');
  aTab1.textContent = 'A1';
  const aTab2 = document.createElement('button');
  aTab2.setAttribute('slot', 'tab');
  aTab2.textContent = 'A2';
  const aPanel1 = document.createElement('div');
  aPanel1.setAttribute('slot', 'panel');
  aPanel1.textContent = 'Panel A1';
  const aPanel2 = document.createElement('div');
  aPanel2.setAttribute('slot', 'panel');
  aPanel2.textContent = 'Panel A2';
  tabsA.append(aTab1, aTab2, aPanel1, aPanel2);

  const tabsB = document.createElement('caps-tabs');
  const bTab1 = document.createElement('button');
  bTab1.setAttribute('slot', 'tab');
  bTab1.textContent = 'B1';
  const bTab2 = document.createElement('button');
  bTab2.setAttribute('slot', 'tab');
  bTab2.textContent = 'B2';
  const bPanel1 = document.createElement('div');
  bPanel1.setAttribute('slot', 'panel');
  bPanel1.textContent = 'Panel B1';
  const bPanel2 = document.createElement('div');
  bPanel2.setAttribute('slot', 'panel');
  bPanel2.textContent = 'Panel B2';
  tabsB.append(bTab1, bTab2, bPanel1, bPanel2);

  document.body.append(tabsA, tabsB);
  await new Promise((resolve) => setTimeout(resolve, 0));

  const generatedPanelIds = [aPanel1.id, aPanel2.id, bPanel1.id, bPanel2.id];
  assert.equal(new Set(generatedPanelIds).size, generatedPanelIds.length);

  assert.equal(aTab1.getAttribute('aria-controls'), aPanel1.id);
  assert.equal(aTab2.getAttribute('aria-controls'), aPanel2.id);
  assert.equal(bTab1.getAttribute('aria-controls'), bPanel1.id);
  assert.equal(bTab2.getAttribute('aria-controls'), bPanel2.id);
});
