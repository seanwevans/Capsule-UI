const requireLayer = require('./require-layer.js').default;

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
    ['/color/', 'fill', 'stroke'],
    {
      ignoreValues: ['transparent', 'inherit', 'currentColor']
    }
  ],
  'at-rule-no-unknown': [true, { ignoreAtRules: ['layer'] }]
};

if (layerRule) {
  rules['capsule-ui/require-layer'] = layerRule;
}

module.exports = {
  plugins: [
    'stylelint-declaration-strict-value',
    requireLayer
  ],
  rules
};
