const test = require('node:test');
const assert = require('node:assert/strict');
const { promises: fs } = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const tsx = require.resolve('tsx');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'build-tokens.ts');
const validateScript = path.join(root, 'scripts', 'validate-tokens.ts');
const tokensPath = path.join(root, 'tokens', 'source', 'tokens.json');

function runBuild(...args) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ['--import', tsx, script, ...args],
      { cwd: root },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr.trim()));
        else resolve(stdout);
      }
    );
  });
}

function runValidate() {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ['--import', tsx, validateScript],
      { cwd: __dirname },
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

test('validate script uses shared schema validator', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ color: { bad: { $type: 'unknown', $value: '#fff' } } }, null, 2)
    );
    const buildErr = await runBuild().catch(e => e);
    const validateErr = await runValidate().catch(e => e);
    const sanitize = (msg) =>
      msg
        .split('\n')
        .filter(line => !line.startsWith('npm warn') && line.trim() !== '')
        .find(line => line.startsWith('Error:')) || '';
    assert.equal(sanitize(buildErr.message), sanitize(validateErr.message));
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects tokens missing theme values', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          color: {
            background: { $type: 'color', $value: { light: '#fff', dark: '#000' } },
            incomplete: { $type: 'color', $value: { light: '#fff' } }
          }
        },
        null,
        2
      )
    );
    await assert.rejects(
      runBuild(),
      /Token 'color\.incomplete' is missing theme 'dark'/
    );
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects invalid token names', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ 'bad name': { ok: { $type: 'color', $value: '#fff' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /Invalid token key 'bad name'/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects uppercase token names', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify({ Color: { ok: { $type: 'color', $value: '#fff' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /Invalid token key 'Color'/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects duplicate token names', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          'color-background': { $type: 'color', $value: '#fff' },
          color: { background: { $type: 'color', $value: '#000' } }
        },
        null,
        2
      )
    );
    await assert.rejects(runBuild(), /Duplicate token name 'color-background'/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('accepts valid token names', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        { 'good-token_1': { inner_value: { $type: 'color', $value: '#000' } } },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--good-token_1-inner_value: #000;/);
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

test('outputs themes in deterministic order', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          color: {
            background: {
              $type: 'color',
              $value: { beta: '#bbb', alpha: '#aaa', gamma: '#ccc' }
            }
          }
        },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    const themeOrder = Array.from(css.matchAll(/\[data-theme="([^"]+)"\]/g)).map(
      m => m[1]
    );
    assert.deepEqual(themeOrder, ['beta', 'gamma']);
    assert.match(css, /:root{\n  --color-background: #aaa;\n}/);
    const json = await fs.readFile(path.join(root, 'dist', 'tokens.json'), 'utf8');
    const alpha = json.indexOf('"alpha"');
    const beta = json.indexOf('"beta"');
    const gamma = json.indexOf('"gamma"');
    assert(alpha < beta && beta < gamma);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('allows setting custom default theme', { concurrency: false }, async () => {
  await runBuild('--default-theme', 'dark');
  const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
  assert.match(css, /:root{\n  --color-background: #000000;/);
  assert.match(css, /\[data-theme="light"\]{\n  --color-background: #ffffff;/);
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

test('accepts number, font-size, font-weight, and duration tokens', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(
      tokensPath,
      JSON.stringify(
        {
          metrics: { weight: { $type: 'number', $value: 400 } },
          font: { base: { $type: 'font-size', $value: '16px' } },
          boldness: { text: { $type: 'font-weight', $value: 700 } },
          motion: { fast: { $type: 'duration', $value: '200ms' } }
        },
        null,
        2
      )
    );
    await runBuild();
    const css = await fs.readFile(path.join(root, 'dist', 'tokens.css'), 'utf8');
    assert.match(css, /--metrics-weight: 400;/);
    assert.match(css, /--font-base: 16px;/);
    assert.match(css, /--boldness-text: 700;/);
    assert.match(css, /--motion-fast: 200ms;/);
    const json = JSON.parse(
      await fs.readFile(path.join(root, 'dist', 'tokens.json'), 'utf8')
    );
    assert.equal(json['--metrics-weight'].light, 400);
    assert.equal(json['--font-base'].light, '16px');
    assert.equal(json['--boldness-text'].light, 700);
    assert.equal(json['--motion-fast'].light, '200ms');
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('rejects invalid number, font-size, font-weight, and duration values', { concurrency: false }, async () => {
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

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ weight: { bad: { $type: 'font-weight', $value: 'heavy' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid font-weight value/);

    await fs.writeFile(
      tokensPath,
      JSON.stringify({ motion: { bad: { $type: 'duration', $value: 'fast' } } }, null, 2)
    );
    await assert.rejects(runBuild(), /invalid duration value/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('generates type declarations for tokens', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(tokensPath, original);
    await runBuild();
    const dts = await fs.readFile(path.join(root, 'dist', 'tokens.d.ts'), 'utf8');

    assert.match(dts, /export type TokenName/);
    for (const name of [
      '--color-background',
      '--color-text',
      '--color-brand',
      '--spacing-sm',
      '--spacing-md',
      '--spacing-lg'
    ]) {
      assert.match(dts, new RegExp(name));
    }

    assert.match(dts, /export type ThemeName = 'dark' \| 'light';/);
    assert.match(dts, /export type TokenValues = Record<ThemeName, string \| number>;/);
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('generates JavaScript module for tokens', { concurrency: false }, async () => {
  const original = await fs.readFile(tokensPath, 'utf8');
  try {
    await fs.writeFile(tokensPath, original);
    await runBuild();
    const js = await fs.readFile(path.join(root, 'dist', 'tokens.js'), 'utf8');
    assert.match(js, /export const tokens/);
    const mod = await import('../dist/tokens.js');
    assert.deepEqual(mod.default['--color-background'], {
      light: '#ffffff',
      dark: '#000000',
    });
  } finally {
    await fs.writeFile(tokensPath, original);
  }
});

test('token artifacts are up to date', { concurrency: false }, async () => {
  await runBuild();
  const status = await new Promise((resolve, reject) => {
    execFile('git', ['status', '--porcelain', 'dist'], { cwd: root }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr.trim()));
      else resolve(stdout.trim());
    });
  });
  assert.equal(status, '', 'run `pnpm tokens:build` and commit the updated files in dist/');
});
