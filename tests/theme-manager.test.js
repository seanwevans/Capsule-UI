const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

test('ThemeManager scopes variables per tenant', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;

  const { ThemeManager } = await import('../packages/core/theme-manager.js');

  ThemeManager.register('a', { 'caps-btn-bg': 'red' });
  ThemeManager.register('b', { 'caps-btn-bg': 'blue' });

  const a = document.createElement('div');
  const b = document.createElement('div');
  ThemeManager.apply('a', a);
  ThemeManager.apply('b', b);
  document.body.append(a, b);

  assert.equal(a.getAttribute('data-tenant'), 'a');
  assert.equal(b.getAttribute('data-tenant'), 'b');

  const styleA = document.getElementById('caps-theme-a').textContent;
  const styleB = document.getElementById('caps-theme-b').textContent;
  assert.ok(styleA.includes('[data-tenant="a"]'));
  assert.ok(styleA.includes('--caps-btn-bg: red'));
  assert.ok(styleB.includes('[data-tenant="b"]'));
  assert.ok(styleB.includes('--caps-btn-bg: blue'));
});

test('ThemeManager loads and switches tenant themes at runtime', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.fetch = async () => ({
    json: async () => ({
      light: { 'caps-btn-bg': 'white' },
      dark: { 'caps-btn-bg': 'black' },
    }),
  });

  const { ThemeManager } = await import('../packages/core/theme-manager.js');

  await ThemeManager.load('t1', 'themes.json');

  const el = document.createElement('div');
  document.body.append(el);

  ThemeManager.applyTheme('t1', 'light', el);
  assert.equal(el.getAttribute('data-tenant'), 't1');
  assert.equal(el.getAttribute('data-theme'), 'light');
  let style = document.getElementById('caps-theme-t1-light').textContent;
  assert.ok(style.includes('[data-tenant="t1"][data-theme="light"]'));
  assert.ok(style.includes('--caps-btn-bg: white'));

  ThemeManager.applyTheme('t1', 'dark', el);
  assert.equal(el.getAttribute('data-theme'), 'dark');
  style = document.getElementById('caps-theme-t1-dark').textContent;
  assert.ok(style.includes('--caps-btn-bg: black'));
});

test('ThemeManager sanitizes invalid tenant names', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;

  const { ThemeManager } = await import('../packages/core/theme-manager.js');

  ThemeManager.register('acme!', { 'caps-btn-bg': 'green' });
  const el = document.createElement('div');
  ThemeManager.apply('acme!', el);
  assert.equal(el.getAttribute('data-tenant'), 'acme-');
  const style = document.getElementById('caps-theme-acme-').textContent;
  assert.ok(style.includes('[data-tenant="acme-"]'));
});

test('ThemeManager sanitizes invalid tenant and theme names', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;

  const { ThemeManager } = await import('../packages/core/theme-manager.js');

  ThemeManager.registerTheme('foo bar', 'dark*mode', { 'caps-btn-bg': 'purple' });
  const el = document.createElement('div');
  ThemeManager.applyTheme('foo bar', 'dark*mode', el);
  assert.equal(el.getAttribute('data-tenant'), 'foo-bar');
  assert.equal(el.getAttribute('data-theme'), 'dark-mode');
  const style = document.getElementById('caps-theme-foo-bar-dark-mode').textContent;
  assert.ok(style.includes('[data-tenant="foo-bar"][data-theme="dark-mode"]'));
});

