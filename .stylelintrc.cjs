const layerEnv = process.env.CAPSULE_LAYER_NAMES;
const layerRule =
  layerEnv === 'off'
    ? null
    : layerEnv
    ? { names: layerEnv.split(',').map((n) => n.trim()).filter(Boolean) }
    : { name: 'components' };

const rules = {
  'selector-max-specificity': '0,1,0',
  'selector-max-type': 0,
  'declaration-no-important': true,
  'scale-unlimited/declaration-strict-value': [
    ['/^color/', '/^background/', 'outline-color', 'fill', 'stroke'],
    {
      ignoreValues: ['transparent', 'inherit', 'currentColor']
    }
  ],
};

if (layerRule) {
  rules['capsule-ui/require-layer'] = layerRule;
}

module.exports = {
  plugins: [
    'stylelint-declaration-strict-value',
    './stylelint/require-layer.js'
  ],
  ignoreFiles: ['dist/**', 'tokens/**'],
  overrides: [
    {
      files: ['**/overrides/**/*.css'],
      rules: {
        'declaration-no-important': null
      }
    }
  ],
  rules,
};
