import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const originalArgv = process.argv;
const originalExit = process.exit;
process.argv = ['node'];
process.exit = () => {};
const { scaffoldComponent } = await import('../packages/capsule-cli/bin/capsule.js');
process.argv = originalArgv;
process.exit = originalExit;

test('scaffoldComponent generates expected files', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'capsule-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    await scaffoldComponent('example-component');
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
