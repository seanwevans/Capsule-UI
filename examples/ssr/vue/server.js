import express from 'express';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

global.HTMLElement = class {};
global.customElements = { define() {}, get() { return undefined; } };

const App = (await import('./App.js')).default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseCss = readFileSync(
  resolve(__dirname, '../../../packages/core/button.module.css'),
  'utf8'
);

const app = express();

app.use('/client.js', express.static('client.js'));

app.get('/', async (req, res) => {
  const vueApp = createSSRApp(App, { message: 'Hello from Vue SSR' });
  const appHtml = await renderToString(vueApp);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vue SSR Example</title>
  <style>
  ${baseCss}
    caps-button[variant="ghost"]::part(button) {
      background: transparent;
      border: 1px solid #4f46e5;
      color: #4f46e5;
    }
  </style>
</head>
<body>
  <div id="app">${appHtml}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000, () => {
  console.log('Vue SSR server running on http://localhost:3000');
});
