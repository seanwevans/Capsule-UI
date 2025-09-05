import { createSSRApp } from 'vue';
import App from './App.js';

const app = createSSRApp(App, { message: 'Hello from Vue SSR' });
app.mount('#app');
