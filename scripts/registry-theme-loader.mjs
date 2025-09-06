#!/usr/bin/env node
import { ThemeManager } from '../packages/core/theme-manager.js';

function flatten(obj, prefix = []) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, [...prefix, k]));
    } else {
      out[[...prefix, k].join('-')] = v;
    }
  }
  return out;
}

const [,, tenant, theme, registryUrl] = process.argv;

if (!tenant || !theme || !registryUrl) {
  console.error('Usage: node scripts/registry-theme-loader.mjs <tenant> <theme-slug> <registry-url>');
  process.exit(1);
}

const base = registryUrl.replace(/\/$/, '');
const res = await fetch(`${base}/themes/${theme}`);
if (!res.ok) {
  console.error(`Failed to fetch theme: ${res.status}`);
  process.exit(1);
}
const json = await res.json();
const vars = flatten(json);
ThemeManager.registerTheme(tenant, theme, vars);
