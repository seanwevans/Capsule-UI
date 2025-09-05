import 'svelte/register';
import express from 'express';

global.HTMLElement = class {};
global.customElements = { define() {}, get() { return undefined; } };

const App = (await import('./App.svelte')).default;

const app = express();

app.use('/client.js', express.static('client.js'));

app.get('/', (req, res) => {
  const { html, head } = App.render({ message: 'Hello from Svelte SSR' });
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Svelte SSR Example</title>
  ${head}
  <style>
    caps-button[variant="ghost"]::part(button) {
      background: transparent;
      border: 1px solid #4f46e5;
      color: #4f46e5;
    }
  </style>
</head>
<body>
  <div id="svelte">${html}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000, () => {
  console.log('Svelte SSR server running on http://localhost:3000');
});
