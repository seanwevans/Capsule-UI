const path = require('path');
const stylelint = require('stylelint');

const pluginPath = path.resolve(__dirname, '../require-layer');
const ruleName = 'capsule-ui/require-layer';

describe('require-layer', () => {
  const config = {
    plugins: [pluginPath],
    rules: { [ruleName]: {} },
  };

  const customConfig = {
    plugins: [pluginPath],
    rules: { [ruleName]: { name: 'utilities' } },
  };

  it('reports error when missing default layer', async () => {
    const result = await stylelint.lint({
      code: '.a{}',
      config,
    });
    const warnings = result.results[0].warnings;
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toBe("Expected '@layer components' declaration. (capsule-ui/require-layer)");
  });

  it('auto-fixes missing default layer', async () => {
    const result = await stylelint.lint({
      code: '.a{}',
      config,
      fix: true,
    });
    expect(result.output).toBe('@layer components;\n.a{}');
  });

  it('reports error when missing custom layer', async () => {
    const result = await stylelint.lint({
      code: '.a{}',
      config: customConfig,
    });
    const warnings = result.results[0].warnings;
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toBe("Expected '@layer utilities' declaration. (capsule-ui/require-layer)");
  });

  it('auto-fixes missing custom layer', async () => {
    const result = await stylelint.lint({
      code: '.a{}',
      config: customConfig,
      fix: true,
    });
    expect(result.output).toBe('@layer utilities;\n.a{}');
  });
});

