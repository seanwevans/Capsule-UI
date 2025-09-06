module.exports = {
  extends: ['eslint:recommended'],
  env: {
    es2021: true,
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['capsule'],
  rules: {
    'capsule/no-unknown-token': 'warn'
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser'
    },
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
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
        ,
        'no-restricted-syntax': [
          'error',
          {
            selector: "JSXAttribute[name.name='className'] Literal",
            message: 'Ad-hoc class names are not allowed. Use a component recipe instead.'
          },
          {
            selector: "JSXAttribute[name.name='style']",
            message: 'Inline style attributes are not allowed.'
          },
          {
            selector: "MemberExpression[property.name='style']",
            message: 'Element.style is not allowed. Use stylesheets or recipes instead.'
          }
        ]
      }
    }
  ]
};
