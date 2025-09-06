import { getLocale, onLocaleChange } from './locale.js';

export function withLocaleDir(Base = HTMLElement) {
  return class extends Base {
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      this._autoDir = !this.hasAttribute('dir');
      if (this._autoDir) {
        this.setAttribute('dir', getLocale().dir);
      }
      this._unsubLocale = onLocaleChange((loc) => {
        if (this._autoDir) this.setAttribute('dir', loc.dir);
        this.localeDirChanged?.(loc);
      });
    }

    disconnectedCallback() {
      this._unsubLocale?.();
      this._unsubLocale = undefined;
      if (super.disconnectedCallback) super.disconnectedCallback();
    }
  };
}
