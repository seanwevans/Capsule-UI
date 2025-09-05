import { trackComponent } from './analytics.js';
import { reportError } from './error-reporting.js';

export function instrumentComponent(name, ctor, { variantAttr = 'variant' } = {}) {
  const originalConnected = ctor.prototype.connectedCallback;
  ctor.prototype.connectedCallback = function (...args) {
    try {
      trackComponent(name, this.getAttribute(variantAttr));
      return originalConnected?.apply(this, args);
    } catch (err) {
      reportError(err);
      throw err;
    }
  };

  for (const method of ['disconnectedCallback', 'attributeChangedCallback']) {
    const original = ctor.prototype[method];
    if (typeof original === 'function') {
      ctor.prototype[method] = function (...args) {
        try {
          return original.apply(this, args);
        } catch (err) {
          reportError(err);
          throw err;
        }
      };
    }
  }
}
