import path from 'path';
import stylelint from 'stylelint';
import { describe, it, expect } from 'vitest';

const config = {
  plugins: [path.join(__dirname, '../require-layer.js')],
  rules: {
    'capsule-ui/require-layer': true,
  },
};

describe('capsule-ui/require-layer', () => {
  it('reports violation when @layer components is missing', async () => {
    const css = `.btn { color: red; }`;
    const result = await stylelint.lint({ code: css, config });
    expect(result.errored).toBe(true);
    expect(result.results[0].warnings).toHaveLength(1);
    expect(result.results[0].warnings[0].text).toContain("Expected '@layer components' declaration.");
  });

  it('passes when @layer components is present', async () => {
    const css = `@layer components { .btn { color: red; } }`;
    const result = await stylelint.lint({ code: css, config });
    expect(result.errored).toBe(false);
    expect(result.results[0].warnings).toHaveLength(0);
  });
});

