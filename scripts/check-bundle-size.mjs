import fs from 'fs';
import path from 'path';

const budgets = [
  { file: path.resolve('dist', 'tokens.js'), maxBytes: 5 * 1024 },
  { file: path.resolve('dist', 'tokens.css'), maxBytes: 5 * 1024 },
  { file: path.resolve('packages', 'core', 'modal.js'), maxBytes: 6 * 1024 },
  { file: path.resolve('packages', 'core', 'modal.module.css'), maxBytes: 2 * 1024 },
  { file: path.resolve('packages', 'core', 'tabs.js'), maxBytes: 6 * 1024 },
  { file: path.resolve('packages', 'core', 'tabs.module.css'), maxBytes: 2 * 1024 }
];

let withinBudget = true;
for (const { file, maxBytes } of budgets) {
  try {
    const { size } = fs.statSync(file);
    if (size > maxBytes) {
      console.error(`Bundle size ${file} ${size} exceeds budget of ${maxBytes} bytes`);
      withinBudget = false;
    } else {
      console.log(`Bundle size ${file} ${size} within budget (${maxBytes} bytes)`);
    }
  } catch (err) {
    console.error(`Unable to check bundle size at ${file}:`, err.message);
    withinBudget = false;
  }
}

if (!withinBudget) {
  process.exit(1);
}
