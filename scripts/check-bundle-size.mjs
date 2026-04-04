import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

/**
 * Bundle-size checks target distributable artifacts, not source files.
 *
 * Prerequisites:
 * 1) Run `pnpm run tokens:build` so `dist/tokens.js` and `dist/tokens.css` exist.
 * 2) Keep package manifests aligned with release packaging. Core component checks read
 *    `npm pack --dry-run --json` metadata and validate `package/<artifact>` entries.
 */

const tokenBudgets = [
  { file: path.resolve('dist', 'tokens.js'), maxBytes: 5 * 1024 },
  { file: path.resolve('dist', 'tokens.css'), maxBytes: 5 * 1024 }
];

const packedArtifactBudgets = [
  { packageDir: path.resolve('packages', 'core'), artifactPath: 'modal.js', maxBytes: 6 * 1024 },
  { packageDir: path.resolve('packages', 'core'), artifactPath: 'modal.module.css', maxBytes: 2 * 1024 },
  { packageDir: path.resolve('packages', 'core'), artifactPath: 'tabs.js', maxBytes: 6 * 1024 },
  { packageDir: path.resolve('packages', 'core'), artifactPath: 'tabs.module.css', maxBytes: 2 * 1024 }
];

function loadPackedFiles(packageDir) {
  const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const parsed = JSON.parse(raw);
  const [packInfo] = parsed;
  if (!packInfo?.files) {
    throw new Error(`Unable to read packed file metadata for ${packageDir}`);
  }

  return new Map(packInfo.files.map((file) => [file.path, file.size]));
}

let withinBudget = true;

for (const { file, maxBytes } of tokenBudgets) {
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

const packedFilesByPackage = new Map();
for (const { packageDir } of packedArtifactBudgets) {
  if (packedFilesByPackage.has(packageDir)) continue;

  try {
    packedFilesByPackage.set(packageDir, loadPackedFiles(packageDir));
  } catch (err) {
    console.error(`Unable to inspect packed artifacts for ${packageDir}:`, err.message);
    withinBudget = false;
  }
}

for (const { packageDir, artifactPath, maxBytes } of packedArtifactBudgets) {
  const packedFiles = packedFilesByPackage.get(packageDir);
  if (!packedFiles) continue;

  const artifactLabel = `${packageDir}#package/${artifactPath}`;
  const artifactSize = packedFiles.get(artifactPath);

  if (artifactSize === undefined) {
    console.error(`Unable to find packed artifact ${artifactLabel}`);
    withinBudget = false;
    continue;
  }

  if (artifactSize > maxBytes) {
    console.error(`Bundle size ${artifactLabel} ${artifactSize} exceeds budget of ${maxBytes} bytes`);
    withinBudget = false;
  } else {
    console.log(`Bundle size ${artifactLabel} ${artifactSize} within budget (${maxBytes} bytes)`);
  }
}

if (!withinBudget) {
  process.exit(1);
}
