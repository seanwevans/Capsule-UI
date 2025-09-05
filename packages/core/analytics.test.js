import test from 'node:test';
import assert from 'node:assert/strict';

test('enableAnalytics sets up and disableAnalytics tears down interval and listener', async () => {
  let intervalSet = 0;
  let intervalCleared = false;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;

  global.setInterval = (fn, time) => {
    intervalSet = time;
    return 123;
  };
  global.clearInterval = (id) => {
    if (id === 123) intervalCleared = true;
  };

  let addCalled = false;
  let removeCalled = false;
  const windowMock = {
    addEventListener: (ev, handler) => {
      if (ev === 'beforeunload') {
        addCalled = true;
        windowMock.handler = handler;
      }
    },
    removeEventListener: (ev, handler) => {
      if (ev === 'beforeunload' && handler === windowMock.handler) {
        removeCalled = true;
      }
    }
  };
  global.window = windowMock;

  const { enableAnalytics, disableAnalytics } = await import('./analytics.js');

  enableAnalytics();
  assert.equal(addCalled, true);
  assert.equal(intervalSet, 60000);

  disableAnalytics();
  assert.equal(removeCalled, true);
  assert.equal(intervalCleared, true);

  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
  delete global.window;
});
