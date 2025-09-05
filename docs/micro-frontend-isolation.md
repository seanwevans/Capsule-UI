# Micro-frontend Shadow DOM isolation

Capsule components render in Shadow DOM to keep host CSS from bleeding into widgets.  In micro-frontends you can mount each widget inside its own shadow root to further isolate styles.

## single-SPA

```js
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: 'capsule-widget',
  app: () => import('capsule/booking-widget'),
  activeWhen: ['/'],
  customProps: {
    domElement: (() => {
      const host = document.getElementById('capsule-host');
      return host.attachShadow({ mode: 'open' });
    })(),
  }
});

start();
```

## Module Federation

```js
import('capsule/booking-widget').then(({ BookingWidget }) => {
  const host = document.getElementById('capsule-host');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(new BookingWidget());
});
```

Both approaches ensure Capsule components live inside a Shadow DOM boundary so host styles cannot leak in and component styles do not leak out.
