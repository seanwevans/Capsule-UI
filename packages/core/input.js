import { getLocale, onLocaleChange } from './locale.js';
import { instrumentComponent } from './instrument.js';

class CapsInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          container-type: inline-size;
        }
        input {
          font: inherit;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text);
          transition: border-color var(--motion-fast);
        }
        :host([variant="outline"]) input { background: transparent; }
        @container (min-width: 480px) {
          input { padding: var(--spacing-md) var(--spacing-lg); }
        }
        input:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          :host { --motion-fast: 0s; }
        }
        @media (prefers-contrast: more) {
          input {
            border-color: var(--color-text);
            background: var(--color-background);
            color: var(--color-text);
          }
        }
      </style>
      <input part="input" />
    `;
  }

  static get observedAttributes() {
    return ['value', 'type', 'placeholder', 'disabled', 'aria-label', 'aria-describedby', 'role'];
  }

  attributeChangedCallback(name, _old, value) {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;
    if (name === 'disabled') {
      if (value !== null) {
        input.setAttribute('disabled', '');
        input.setAttribute('aria-disabled', 'true');
      } else {
        input.removeAttribute('disabled');
        input.removeAttribute('aria-disabled');
      }
    } else if (name === 'value') {
      if (value !== null) {
        input.setAttribute('value', value);
        input.value = value;
      } else {
        input.removeAttribute('value');
        input.value = '';
      }
    } else if (name.startsWith('aria-') || name === 'role' || name === 'placeholder' || name === 'type') {
      if (value !== null) input.setAttribute(name, value);
      else input.removeAttribute(name);
    }
  }

  connectedCallback() {
    if (!this.hasAttribute('dir')) {
      this.setAttribute('dir', getLocale().dir);
      this._unsub = onLocaleChange((loc) => {
        if (!this.hasAttribute('dir')) this.setAttribute('dir', loc.dir);
      });
    }
  }

  disconnectedCallback() {
    this._unsub?.();
  }

  focus() {
    this.shadowRoot.querySelector('input')?.focus();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get value() {
    const input = this.shadowRoot.querySelector('input');
    return input?.value || '';
  }

  set value(v) {
    if (v) {
      this.setAttribute('value', v);
    } else {
      this.removeAttribute('value');
    }
  }
}

instrumentComponent('caps-input', CapsInput);

if (!customElements.get('caps-input')) {
  customElements.define('caps-input', CapsInput);
}

export { CapsInput };
