const test = require('node:test');
const assert = require('node:assert/strict');

test('setTheme updates current theme without a document', async () => {
  const originalDocument = global.document;

  try {
    delete global.document;

    const { getTheme, setTheme } = await import('../packages/core/theme.js');

    const originalTheme = getTheme();
    const nextTheme = originalTheme === 'light' ? 'dark' : 'light';

    setTheme(nextTheme);
    assert.equal(getTheme(), nextTheme);

    setTheme(originalTheme);
  } finally {
    if (typeof originalDocument !== 'undefined') {
      global.document = originalDocument;
    } else {
      delete global.document;
    }
  }
});
