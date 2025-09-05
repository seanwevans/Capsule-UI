import fs from 'fs';
import path from 'path';

const bundlePath = path.resolve('dist', 'tokens.js');
const maxBytes = 5 * 1024; // 5KB budget

try {
  const { size } = fs.statSync(bundlePath);
  if (size > maxBytes) {
    console.error(`Bundle size ${size} exceeds budget of ${maxBytes} bytes`);
    process.exit(1);
  } else {
    console.log(`Bundle size ${size} within budget (${maxBytes} bytes)`);
  }
} catch (err) {
  console.error(`Unable to check bundle size at ${bundlePath}:`, err.message);
  process.exit(1);
}
