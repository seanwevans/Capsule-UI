/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testMatch: ['**/*.spec.js'],
  use: {
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  }
};
