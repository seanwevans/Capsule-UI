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
    global.Event = dom.window.Event;
    global.FormData = dom.window.FormData;
    await import('../packages/core/select.js');
  } else {
    dom.window.document.body.innerHTML = '';
  }
  return dom.window;
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

test('caps-select multiple submits all selected values when posting a form', async () => {
  const window = await setupDom();
  const proto = window.HTMLElement.prototype;
  const originalAttachInternals = proto.attachInternals;

  try {
    delete proto.attachInternals;

    const form = document.createElement('form');
    const select = document.createElement('caps-select');
    select.setAttribute('multiple', '');
    select.setAttribute('name', 'flavor');
    select.innerHTML = `
      <option value="vanilla" selected>Vanilla</option>
      <option value="chocolate" selected>Chocolate</option>
      <option value="strawberry">Strawberry</option>
    `;
    form.appendChild(select);
    document.body.appendChild(form);

    await Promise.resolve();

    const entries = [...new window.FormData(form).entries()];
    assert.deepEqual(entries, [
      ['flavor', 'vanilla'],
      ['flavor', 'chocolate'],
    ]);

    const proxyInputs = select.querySelectorAll('input[data-caps-select-proxy-value]');
    assert.equal(proxyInputs.length, 2);
  } finally {
    if (originalAttachInternals) {
      proto.attachInternals = originalAttachInternals;
    } else {
      delete proto.attachInternals;
    }
  }
});

test('caps-select multiple uses ElementInternals FormData when available', async () => {
  const window = await setupDom();
  const proto = window.HTMLElement.prototype;
  const originalAttachInternals = proto.attachInternals;
  const calls = [];

  proto.attachInternals = function attachInternals() {
    return {
      setFormValue(value, state) {
        calls.push({ value, state });
      },
      setValidity() {},
      states: {
        add() {},
        delete() {},
      },
    };
  };

  try {
    const form = document.createElement('form');
    const select = document.createElement('caps-select');
    select.setAttribute('multiple', '');
    select.setAttribute('name', 'flavors');
    select.innerHTML = `
      <option value="vanilla" selected>Vanilla</option>
      <option value="chocolate" selected>Chocolate</option>
      <option value="strawberry">Strawberry</option>
    `;
    form.appendChild(select);
    document.body.appendChild(form);

    await Promise.resolve();

    const lastCall = calls.at(-1);
    assert.ok(lastCall, 'Expected setFormValue to be called');
    assert.ok(lastCall.value instanceof window.FormData);
    assert.deepEqual([...lastCall.value.entries()], [
      ['flavors', 'vanilla'],
      ['flavors', 'chocolate'],
    ]);
    assert.deepEqual(lastCall.state, ['vanilla', 'chocolate']);
  } finally {
    if (originalAttachInternals) {
      proto.attachInternals = originalAttachInternals;
    } else {
      delete proto.attachInternals;
    }
  }
});
