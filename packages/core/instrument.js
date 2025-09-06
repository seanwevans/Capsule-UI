import { trackComponent } from './analytics.js';
import { reportError } from './error-reporting.js';

export function instrumentComponent(name, ctor, { variantAttr = 'variant' } = {}) {
  const originalConnected = ctor.prototype.connectedCallback;
  ctor.prototype.connectedCallback = function (...args) {
    const start = typeof performance !== 'undefined' ? performance.now() : undefined;
    try {
      trackComponent(name, this.getAttribute(variantAttr));
      return originalConnected?.apply(this, args);
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      if (start !== undefined) {
        const duration = performance.now() - start;
        console.debug(`[capsule:perf] ${name}.connectedCallback ${duration.toFixed(2)}ms`);
      }
    }
  };

  for (const method of ['disconnectedCallback', 'attributeChangedCallback']) {
    const original = ctor.prototype[method];
    if (typeof original === 'function') {
      ctor.prototype[method] = function (...args) {
        const start = typeof performance !== 'undefined' ? performance.now() : undefined;
        try {
          return original.apply(this, args);
        } catch (err) {
          reportError(err);
          throw err;
        } finally {
          if (start !== undefined) {
            const duration = performance.now() - start;
            console.debug(`[capsule:perf] ${name}.${method} ${duration.toFixed(2)}ms`);
          }
        }
      };
    }
  }
}
