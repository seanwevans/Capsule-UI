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

