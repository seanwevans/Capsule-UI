import pa11y from 'pa11y';

(async () => {
  try {
    await pa11y('examples/index.html', {
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    console.log('Accessibility check passed');
  } catch (err) {
    console.error('Accessibility check failed');
    console.error(err.message);
    process.exit(1);
  }
})();
