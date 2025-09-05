import App from './App.svelte';

const app = new App({
  target: document.getElementById('svelte'),
  hydrate: true,
  props: { message: 'Hello from Svelte SSR' }
});

export default app;
