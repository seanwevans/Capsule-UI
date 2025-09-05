module.exports = {
  extends: [require.resolve('./packages/stylelint-config-capsule')],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'selector-max-specificity': '0,1,0',
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'fill', 'stroke'],
      {
        ignoreValues: ['transparent', 'inherit', 'currentColor'],
      },
    ],
  },
};
