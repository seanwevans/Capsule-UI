const test = require('node:test');
const assert = require('node:assert/strict');

test('dispatchSafeEvent sanitizes event names and defaults', async () => {
  const { dispatchSafeEvent } = await import('../packages/core/events.js');
  const target = new EventTarget();
  let received = false;
  target.addEventListener('caps-test', (e) => {
    received = e.detail.value === 42 && e.bubbles === false && e.composed === false;
  });
  dispatchSafeEvent(target, 'caps test', { value: 42 }, { bubbles: false });
  assert.ok(received);
});

test('dispatchSafeEvent sanitizes invalid names', async () => {
  const { dispatchSafeEvent } = await import('../packages/core/events.js');
  const target = new EventTarget();
  let fired = false;
  target.addEventListener('bad-name', () => {
    fired = true;
  });
  dispatchSafeEvent(target, 'bad/name');
  assert.ok(fired);
});
