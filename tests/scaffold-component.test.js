const test = require('node:test');
const assert = require('node:assert/strict');
const {
  mkdtemp,
  rm,
  access,
  readFile,
  writeFile,
  mkdir,
} = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const process = require('node:process');
const { execFile } = require('node:child_process');

const cli = path.join(
  __dirname,
  '..',
  'packages',
  'capsule-cli',
  'bin',
  'capsule.js'
);

function run(args, options = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [cli, ...args], options, (error, stdout, stderr) => {
      resolve({
        code: error && typeof error.code === 'number' ? error.code : 0,
        stdout,
        stderr,
      });
    });
  });
}

test('scaffolds component with valid name', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code } = await run(['new', 'component', 'valid-name'], { cwd: tmp });
    assert.equal(code, 0);
    await access(path.join(tmp, 'packages', 'components', 'ValidName'));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('scaffolds component with mixed-case name', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code } = await run(['new', 'component', 'MY_component'], { cwd: tmp });
    assert.equal(code, 0);
    await access(path.join(tmp, 'packages', 'components', 'MyComponent'));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('scaffolds component to custom directory via CLI', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code } = await run(
      ['new', 'component', 'custom-dir-comp', '--dir', 'custom-components'],
      { cwd: tmp }
    );
    assert.equal(code, 0);
    await access(path.join(tmp, 'custom-components', 'CustomDirComp'));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('scaffolds multiple components out of order via CLI', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    let res = await run(['new', 'component', 'beta-component'], { cwd: tmp });
    assert.equal(res.code, 0);
    res = await run(['new', 'component', 'gamma-component'], { cwd: tmp });
    assert.equal(res.code, 0);
    res = await run(['new', 'component', 'alpha-component'], { cwd: tmp });
    assert.equal(res.code, 0);
    const indexPath = path.join(tmp, 'packages', 'components', 'index.ts');
    const rootIndex = await readFile(indexPath, 'utf8');
    const lines = rootIndex.trim().split('\n');
    assert.equal(new Set(lines).size, lines.length);
    assert.deepEqual(lines, [
      `export * from './AlphaComponent/AlphaComponent';`,
      `export * from './BetaComponent/BetaComponent';`,
      `export * from './GammaComponent/GammaComponent';`,
    ]);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('rejects invalid component name', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(
      ['new', 'component', 'invalid name!'],
      { cwd: tmp }
    );
    assert.equal(code, 1);
    assert.match(stderr, /Invalid component name/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('rejects component name starting with a number', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(
      ['new', 'component', '123abc'],
      { cwd: tmp }
    );
    assert.equal(code, 1);
    assert.match(stderr, /must start with a letter/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('rejects component name with trailing separator', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(
      ['new', 'component', 'invalid-'],
      { cwd: tmp }
    );
    assert.equal(code, 1);
    assert.match(stderr, /Invalid component name/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('rejects component name with repeated separators', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    const { code, stderr } = await run(
      ['new', 'component', 'invalid__name'],
      { cwd: tmp }
    );
    assert.equal(code, 1);
    assert.match(stderr, /Invalid component name/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('fails when component already exists', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  try {
    let res = await run(['new', 'component', 'dupe'], { cwd: tmp });
    assert.equal(res.code, 0);
    res = await run(['new', 'component', 'dupe'], { cwd: tmp });
    assert.equal(res.code, 1);
    assert.match(res.stderr, /already exists/);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('scaffoldComponent returns true and generates expected files', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    const result = await scaffoldComponent('example-component');
    assert.equal(result, true);
    const baseDir = path.join(tempDir, 'packages', 'components', 'ExampleComponent');
    const component = await readFile(path.join(baseDir, 'ExampleComponent.ts'), 'utf8');
    const style = await readFile(path.join(baseDir, 'style.ts'), 'utf8');
    const index = await readFile(path.join(baseDir, 'index.ts'), 'utf8');
    const testFile = await readFile(
      path.join(baseDir, '__tests__', 'ExampleComponent.test.ts'),
      'utf8'
    );
    const rootIndex = await readFile(
      path.join(tempDir, 'packages', 'components', 'index.ts'),
      'utf8'
    );

    assert.equal(
      component,
      `export const ExampleComponent = () => {\n  // TODO: implement ExampleComponent component\n};\n`
    );
    assert.equal(
      style,
      `export interface ExampleComponentStyleProps {\n  // TODO: define style props\n}\n\nexport const createExampleComponentStyles = (_: ExampleComponentStyleProps) => {\n  // TODO: implement Style API\n};\n`
    );
    assert.equal(index, `export * from './ExampleComponent';\n`);
    assert.equal(
      testFile,
      `describe('ExampleComponent', () => {\n  it('should render correctly', () => {\n    expect(true).toBe(true);\n  });\n});\n`
    );
    assert.equal(
      rootIndex,
      `export * from './ExampleComponent/ExampleComponent';\n`
    );
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('scaffoldComponent respects custom base directory', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    const result = await scaffoldComponent('custom-base', 'custom-dir');
    assert.equal(result, true);
    await access(path.join(tempDir, 'custom-dir', 'CustomBase'));
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('updates root components index on subsequent scaffolds', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    await scaffoldComponent('second-component');
    await scaffoldComponent('first-component');
    const rootIndex = await readFile(
      path.join(tempDir, 'packages', 'components', 'index.ts'),
      'utf8'
    );
    assert.equal(
      rootIndex,
      `export * from './FirstComponent/FirstComponent';\nexport * from './SecondComponent/SecondComponent';\n`
    );
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('deduplicates and sorts root components index', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    await scaffoldComponent('beta-component');
    const indexPath = path.join(tempDir, 'packages', 'components', 'index.ts');
    // introduce duplicate line
    await writeFile(
      indexPath,
      `export * from './BetaComponent/BetaComponent';\nexport * from './BetaComponent/BetaComponent';\n`
    );
    await scaffoldComponent('alpha-component');
    const rootIndex = await readFile(indexPath, 'utf8');
    assert.equal(
      rootIndex,
      `export * from './AlphaComponent/AlphaComponent';\nexport * from './BetaComponent/BetaComponent';\n`
    );
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('cleans up generated files on failure', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const componentsDir = path.join(tempDir, 'packages', 'components');
    await mkdir(componentsDir, { recursive: true });
    const indexPath = path.join(componentsDir, 'index.ts');
    await mkdir(indexPath, { recursive: true });
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    const result = await scaffoldComponent('broken-component');
    assert.equal(result, false);
    const baseDir = path.join(componentsDir, 'BrokenComponent');
    await assert.rejects(() => access(baseDir));
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('restores root index if failure occurs after index update', { concurrency: false }, async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const componentsDir = path.join(tempDir, 'packages', 'components');
    await mkdir(componentsDir, { recursive: true });
    const indexPath = path.join(componentsDir, 'index.ts');
    await writeFile(indexPath, `export * from './Existing/Existing';\n`);
    const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
    const originalLog = console.log;
    try {
      console.log = () => {
        throw new Error('boom');
      };
      const result = await scaffoldComponent('new-component');
      assert.equal(result, false);
    } finally {
      console.log = originalLog;
    }
    const rootIndex = await readFile(indexPath, 'utf8');
    assert.equal(rootIndex, `export * from './Existing/Existing';\n`);
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

