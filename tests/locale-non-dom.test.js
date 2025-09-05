const test = require('node:test');
const assert = require('node:assert/strict');

test('locale functions operate without DOM', async () => {
  delete global.window;
  delete global.document;
  delete global.CustomEvent;

  const locale = await import('../packages/core/locale.js');

  assert.deepEqual(locale.getLocale(), { lang: 'en', dir: 'ltr' });

  assert.doesNotThrow(() => {
    locale.setLocale({ lang: 'fr', dir: 'rtl' });
  });

  assert.deepEqual(locale.getLocale(), { lang: 'fr', dir: 'rtl' });

  assert.doesNotThrow(() => {
    const off = locale.onLocaleChange(() => {});
    off();
  });
});

