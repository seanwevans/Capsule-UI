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

test('in-flight analytics send preserves new increments', async () => {
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  const originalFetch = global.fetch;

  const fetchCalls = [];
  global.fetch = (url, options) => {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    fetchCalls.push({ url, options, resolve });
    return promise;
  };

  global.setInterval = (fn) => {
    return 1;
  };
  global.clearInterval = () => {};

  const windowMock = {
    addEventListener: (ev, handler) => {
      if (ev === 'beforeunload') {
        windowMock.handler = handler;
      }
    },
    removeEventListener: () => {}
  };
  global.window = windowMock;

  const { enableAnalytics, disableAnalytics, trackComponent } = await import('./analytics.js');

  enableAnalytics({ endpoint: '/analytics' });
  assert.equal(typeof windowMock.handler, 'function');

  trackComponent('Button', 'primary');

  const sendPromise = windowMock.handler();
  assert.equal(fetchCalls.length, 1);
  const firstPayload = JSON.parse(fetchCalls[0].options.body);
  assert.deepEqual(firstPayload, { counts: { 'Button:primary': 1 } });

  trackComponent('Button', 'primary');

  fetchCalls[0].resolve();
  await sendPromise;

  const secondSendPromise = windowMock.handler();
  assert.equal(fetchCalls.length, 2);
  const secondPayload = JSON.parse(fetchCalls[1].options.body);
  assert.deepEqual(secondPayload, { counts: { 'Button:primary': 1 } });
  fetchCalls[1].resolve();
  await secondSendPromise;

  disableAnalytics();

  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    delete global.fetch;
  }
  delete global.window;
});
