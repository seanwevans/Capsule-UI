const test = require('node:test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

test('setTheme updates current theme without a document', async () => {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '../packages/core/theme.js')).href;
  const script = `
    import { getTheme, setTheme } from ${JSON.stringify(moduleUrl)};
    const originalTheme = getTheme();
    const nextTheme = originalTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (getTheme() !== nextTheme) {
      throw new Error('Theme did not update');
    }
    setTheme(originalTheme);
  `;

  await execFileAsync(process.execPath, ['--input-type=module', '--eval', script]);
});
