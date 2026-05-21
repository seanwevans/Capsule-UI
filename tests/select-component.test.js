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

test('caps-select reconnect does not duplicate slotchange sync handlers', async () => {
  const window = await setupDom();
  const proto = window.HTMLElement.prototype;
  const originalAttachInternals = proto.attachInternals;
  let setFormValueCalls = 0;

  proto.attachInternals = function attachInternals() {
    return {
      setFormValue() {
        setFormValueCalls += 1;
      },
      setValidity() {},
      states: {
        add() {},
        delete() {},
      },
    };
  };

  try {
    const select = document.createElement('caps-select');
    select.innerHTML = '<option value="a">A</option>';
    document.body.appendChild(select);

    const slot = select.shadowRoot.querySelector('slot');
    assert.ok(slot);

    document.body.removeChild(select);
    document.body.appendChild(select);

    await Promise.resolve();

    const callsBeforeMutation = setFormValueCalls;
    select.innerHTML = '<option value="b">B</option>';
    await Promise.resolve();

    assert.equal(setFormValueCalls - callsBeforeMutation, 1);
    assert.equal(select.shadowRoot.querySelectorAll('select option').length, 1);
    assert.equal(select.shadowRoot.querySelector('select').value, 'b');
  } finally {
    if (originalAttachInternals) {
      proto.attachInternals = originalAttachInternals;
    } else {
      delete proto.attachInternals;
    }
  }
});

test('caps-select size attribute accepts valid numeric value', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('size', '3');

  const internalSelect = el.shadowRoot.querySelector('select');
  const proxySelect = el.querySelector('select[slot="proxy"]');
  assert.equal(internalSelect.getAttribute('size'), '3');
  assert.equal(proxySelect?.getAttribute('size'), '3');
});

test('caps-select size attribute rejects non-numeric value', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('size', 'not-a-number');

  const internalSelect = el.shadowRoot.querySelector('select');
  const proxySelect = el.querySelector('select[slot="proxy"]');
  assert.equal(internalSelect.hasAttribute('size'), false);
  assert.equal(proxySelect?.hasAttribute('size'), false);
});

test('caps-select size attribute rejects zero and negative values', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('size', '0');
  let internalSelect = el.shadowRoot.querySelector('select');
  let proxySelect = el.querySelector('select[slot="proxy"]');
  assert.equal(internalSelect.hasAttribute('size'), false);
  assert.equal(proxySelect?.hasAttribute('size'), false);

  el.setAttribute('size', '-2');
  internalSelect = el.shadowRoot.querySelector('select');
  proxySelect = el.querySelector('select[slot="proxy"]');
  assert.equal(internalSelect.hasAttribute('size'), false);
  assert.equal(proxySelect?.hasAttribute('size'), false);
});

test('caps-select size attribute is removed from internal and proxy selects', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  el.setAttribute('size', '4');
  el.removeAttribute('size');

  const internalSelect = el.shadowRoot.querySelector('select');
  const proxySelect = el.querySelector('select[slot="proxy"]');
  assert.equal(internalSelect.hasAttribute('size'), false);
  assert.equal(proxySelect?.hasAttribute('size'), false);
});

test('caps-select restores change handling after reconnect', async () => {
  await setupDom();

  const el = document.createElement('caps-select');
  el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
  document.body.appendChild(el);

  const receivedChanges = [];
  el.addEventListener('change', () => {
    receivedChanges.push(el.value);
  });

  el.remove();
  document.body.appendChild(el);

  const internalSelect = el.shadowRoot.querySelector('select');
  internalSelect.value = 'b';
  internalSelect.dispatchEvent(new Event('change', { bubbles: true }));

  assert.equal(el.getAttribute('value'), 'b');
  assert.equal(receivedChanges.length, 1);
  assert.equal(receivedChanges[0], 'b');
});
