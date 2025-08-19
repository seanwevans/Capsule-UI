const test = require('node:test');
const assert = require('node:assert/strict');
require('ts-node/register');

const { validators } = require('../scripts/token-validators.ts');

function expectPass(fn) {
  assert.doesNotThrow(fn);
}

function expectFail(fn, msg) {
  assert.throws(fn, msg);
}

test('color validator', () => {
  expectPass(() => validators.color('color', '#fff'));
  expectPass(() => validators.color('color', 'rgb(0,0,0)'));
  expectFail(() => validators.color('color', 'nope'), /invalid color value/);
});

test('dimension validator', () => {
  expectPass(() => validators.dimension('dim', '10px'));
  expectPass(() => validators.dimension('dim', '50%'));
  expectFail(() => validators.dimension('dim', '10qq'), /invalid dimension value/);
});

test('number validator', () => {
  expectPass(() => validators.number('num', 5));
  expectFail(() => validators.number('num', '5'), /invalid number value/);
});

test('font-size validator', () => {
  expectPass(() => validators['font-size']('size', '16px'));
  expectFail(() => validators['font-size']('size', 'huge'), /invalid font-size value/);
});

test('font-weight validator', () => {
  expectPass(() => validators['font-weight']('weight', 700));
  expectPass(() => validators['font-weight']('weight', 'bold'));
  expectFail(() => validators['font-weight']('weight', 'heavy'), /invalid font-weight value/);
});

test('duration validator', () => {
  expectPass(() => validators.duration('dur', '200ms'));
  expectFail(() => validators.duration('dur', 'fast'), /invalid duration value/);
});
