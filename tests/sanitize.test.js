const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.window = window;
global.document = window.document;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;

test('sanitizeHTML removes dangerous href schemes', async () => {
  const { sanitizeHTML } = await import('../packages/core/sanitize.js');
  const dirty = '<a href="  JAVAscript:alert(1)">Click</a>';
  const sanitized = sanitizeHTML(dirty);
  assert.equal(sanitized, '<a>Click</a>');
});

test('sanitizeHTML preserves safe href values', async () => {
  const { sanitizeHTML } = await import('../packages/core/sanitize.js');
  const dirty = '<a href="/safe/path">Link</a>';
  const sanitized = sanitizeHTML(dirty);
  assert.equal(sanitized, '<a href="/safe/path">Link</a>');
});

test('sanitizeHTML removes srcset when unsafe values are present', async () => {
  const { sanitizeHTML } = await import('../packages/core/sanitize.js');
  const dirty = '<img srcset="safe.jpg 1x, javascript:alert(1) 2x, data:text/html;base64,PHNjcmlwdD4= 3x">';
  const sanitized = sanitizeHTML(dirty);
  assert.equal(sanitized, '<img>');
});

test('sanitizeHTML preserves safe srcset values', async () => {
  const { sanitizeHTML } = await import('../packages/core/sanitize.js');
  const dirty = '<img srcset="safe-1x.jpg 1x, safe-2x.jpg 2x">';
  const sanitized = sanitizeHTML(dirty);
  assert.equal(sanitized, '<img srcset="safe-1x.jpg 1x, safe-2x.jpg 2x">');
});

test('sanitizeHTML removes dangerous SVG references', async () => {
  const { sanitizeHTML } = await import('../packages/core/sanitize.js');
  const dirty =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="data:text/html;base64,PHNjcmlwdD4=" href="javascript:evil" /></svg>';
  const sanitized = sanitizeHTML(dirty);
  assert.match(sanitized, /<use\b[^>]*>/);
  assert.ok(!/xlink:href=/.test(sanitized));
  assert.ok(!/href="javascript:evil"/.test(sanitized));
});
