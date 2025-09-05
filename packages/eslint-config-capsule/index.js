const requireLayer = require('./require-layer');

module.exports = {
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: {
    'capsule-ui': {
      rules: {
        'require-layer': requireLayer,
      },
    },
  },
  rules: {
    'capsule-ui/require-layer': 'error',
  },
};
