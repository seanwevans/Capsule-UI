const test = require('node:test');
const assert = require('node:assert/strict');
const { promises: fs } = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'build-tokens.ts');
const tokensPath = path.join(root, 'tokens', 'source', 'tokens.json');

function runBuild() {
  return new Promise((resolve, reject) => {
    execFile(
      'npx',
      ['ts-node', '--compiler-options', '{"module":"commonjs"}', script],
      { cwd: root },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr.trim()));
        else resolve(stdout);
      }
    );
  });
}

test('build tokens validation errors', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'color', $value: 'nope' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid color value/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'unknown', $value: '#fff' } } }, null, 2)
    );
    await assert.rejects(
      runBuild(),
      /Token schema validation failed: .*must be equal to one of the allowed values/
    );

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'color' } } }, null, 2)
    );
    await assert.rejects(
      runBuild(),
      /Token schema validation failed: .*must have required property '\$value'/
    );

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $value: '#fff' } } }, null, 2)
    );
    await assert.rejects(
      runBuild(),
      /Token schema validation failed: .*must have required property '\$type'/
    );
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('tokens with null values are handled gracefully', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'color', $value: null } } }, null, 2)
    );
    await assert.rejects(runBuild(), /Token schema validation failed/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('accepts various color formats and outputs sorted tokens', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          color: {
            zeta: { $type: 'color', $value: '#11223344' },
            alpha: { $type: 'color', $value: 'rgb(0,0,0)' },
            middle: { $type: 'color', $value: 'hsl(0,0%,0%)' }
          }
        },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--color-alpha: rgb\(0,0,0\);/);
    assert.match(css, /--color-middle: hsl\(0,0%,0%\);/);
    assert.match(css, /--color-zeta: #11223344;/);
    const vars = css
      .split('\n')
      .filter(line => line.startsWith('  --'))
      .map(line => line.match(/^\s{2}(--[^:]+):/)[1]);
    assert.deepEqual(vars, [...vars].sort());
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('accepts negative dimension values', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        { spacing: { neg: { $type: 'dimension', $value: '-4px' } } },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--spacing-neg: -4px;/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('accepts extended color formats and dimension units', async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          color: {
            keyword: { $type: 'color', $value: 'rebeccapurple' },
            hwb: { $type: 'color', $value: 'hwb(90 0% 0%)' },
            lch: { $type: 'color', $value: 'lch(50% 40 30)' }
          },
          spacing: {
            vh: { $type: 'dimension', $value: '10vh' },
            vw: { $type: 'dimension', $value: '5vw' },
            ch: { $type: 'dimension', $value: '2ch' }
          }
        },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--color-keyword: rebeccapurple;/);
    assert.match(css, /--color-hwb: hwb\(90 0% 0%\);/);
    assert.match(css, /--color-lch: lch\(50% 40 30\);/);
    assert.match(css, /--spacing-vh: 10vh;/);
    assert.match(css, /--spacing-vw: 5vw;/);
    assert.match(css, /--spacing-ch: 2ch;/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects invalid extended formats', async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        { color: { bad: { $type: 'color', $value: 'hwb(0 0 0 0)' } } },
        null,
        2
      )
    );
    await assert.rejects(runBuild(), /invalid color value/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        { spacing: { bad: { $type: 'dimension', $value: '10qq' } } },
        null,
        2
      )
    );
    await assert.rejects(runBuild(), /invalid dimension value/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('accepts number and font-size tokens', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          metrics: { weight: { $type: 'number', $value: 400 } },
          font: { base: { $type: 'font-size', $value: '16px' } }
        },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--metrics-weight: 400;/);
    assert.match(css, /--font-base: 16px;/);
    const json = JSON.parse(
      await fs.readFile(path.join(root, 'dist', 'tokens.json'), 'utf8')
    );
    assert.equal(json['--metrics-weight'].light, 400);
    assert.equal(json['--font-base'].light, '16px');
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects invalid number and font-size values', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ metrics: { bad: { $type: 'number', $value: 'oops' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid number value/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ font: { bad: { $type: 'font-size', $value: 'huge' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid font-size value/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});
