const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('formatNumber and formatDate respect locale', async () => {
  const dom = new JSDOM('<!doctype html><html lang="en"><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.CustomEvent = dom.window.CustomEvent;

  const locale = await import('../packages/core/locale.js');
  assert.equal(locale.formatNumber(1000.5), new Intl.NumberFormat('en').format(1000.5));
  const date = new Date(Date.UTC(2020, 0, 2));
  assert.equal(
    locale.formatDate(date, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }),
    new Intl.DateTimeFormat('en', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
  );

  locale.setLocale({ lang: 'de' });
  assert.equal(locale.formatNumber(1000.5), new Intl.NumberFormat('de').format(1000.5));
  assert.equal(
    locale.formatDate(date, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }),
    new Intl.DateTimeFormat('de', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
  );
});
