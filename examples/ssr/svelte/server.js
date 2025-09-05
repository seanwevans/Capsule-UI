import 'svelte/register';
import express from 'express';
import App from './App.svelte';

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
