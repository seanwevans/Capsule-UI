const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm, access, readFile } = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
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
    execFile('node', [cli, ...args], options, (error, stdout, stderr) => {
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
    const testFile = await readFile(path.join(baseDir, '__tests__', 'ExampleComponent.test.ts'), 'utf8');

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
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});

