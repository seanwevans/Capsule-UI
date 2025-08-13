module.exports = {
  extends: ['eslint:recommended'],
  env: {
    es2021: true,
    browser: true,
    node: true
  },
  overrides: [
    {
      files: ['src/components/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'styled-components',
                message: 'Runtime CSS-in-JS is not allowed in components.'
              },
              {
                name: '@emotion/react',
                message: 'Runtime CSS-in-JS is not allowed in components.'
              },
              {
                name: '@emotion/styled',
                message: 'Runtime CSS-in-JS is not allowed in components.'
              },
              {
                name: 'aphrodite',
                message: 'Runtime CSS-in-JS is not allowed in components.'
              },
              {
                name: 'jss',
                message: 'Runtime CSS-in-JS is not allowed in components.'
              }
            ]
          }
        ]
      }
    }
  ]
};
