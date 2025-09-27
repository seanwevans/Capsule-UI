const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

let dom;

async function setupDom() {
  if (!dom) {
    dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.Node = dom.window.Node;
    global.Element = dom.window.Element;
    await import('../packages/core/select.js');
  } else {
    dom.window.document.body.innerHTML = '';
  }
  return dom;
}

test('caps-select reflects value and disabled', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('value', 'b');
  assert.equal(el.value, 'b');
  assert.equal(el.shadowRoot.querySelector('select').value, 'b');

  el.value = 'a';
  assert.equal(el.getAttribute('value'), 'a');
  assert.equal(el.shadowRoot.querySelector('select').value, 'a');

  el.value = '';
  assert.equal(el.hasAttribute('value'), false);
  assert.equal(el.shadowRoot.querySelector('select').value, '');

  el.disabled = true;
  assert.equal(el.shadowRoot.querySelector('select').disabled, true);
});

test('caps-select required prevents submission until a value is chosen', async () => {
  await setupDom();

  const form = document.createElement('form');
  const select = document.createElement('caps-select');
  select.setAttribute('required', '');
  select.setAttribute('name', 'flavor');
  select.innerHTML = '<option value="">Select an option</option><option value="a">A</option>';
  form.appendChild(select);
  document.body.appendChild(form);

  const internalSelect = select.shadowRoot.querySelector('select');
  assert.equal(internalSelect.required, true);
  assert.equal(form.checkValidity(), false);
  assert.equal(internalSelect.validity.valueMissing, true);

  select.value = 'a';
  await Promise.resolve();
  assert.equal(internalSelect.value, 'a');
  assert.equal(form.checkValidity(), true);
  assert.equal(internalSelect.validity.valueMissing, false);
  assert.deepEqual([...new window.FormData(form).entries()], [['flavor', 'a']]);
});
