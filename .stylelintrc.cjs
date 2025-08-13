module.exports = {
  plugins: [
    'stylelint-declaration-strict-value',
    './stylelint/require-layer.js'
  ],
  rules: {
    'selector-max-specificity': '0,1,0',
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'fill', 'stroke'],
      {
        ignoreValues: ['transparent', 'inherit', 'currentColor']
      }
    ],
    'capsule-ui/require-layer': true
  }
};
