/** @type { import('@storybook/web-components').StorybookConfig } */
const config = {
  stories: ['../packages/core/**/*.stories.js'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/web-components',
    options: {}
  }
};
export default config;
