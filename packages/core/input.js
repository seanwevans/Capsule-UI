import { getLocale, onLocaleChange } from './locale.js';

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
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--caps-input-border, #d1d5db);
          border-radius: 0.375rem;
          background: var(--caps-input-bg, #fff);
          color: var(--caps-input-color, #0f172a);
          transition: border-color var(--caps-motion);
        }
        :host([variant="outline"]) input { background: transparent; }
        @container (min-width: 480px) {
          input { padding: 0.75rem 1rem; }
        }
        input:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          :host { --caps-motion: 0s; }
        }
        @media (prefers-contrast: more) {
          input {
            border-color: var(--caps-input-border-contrast, #000);
            background: var(--caps-input-bg-contrast, #fff);
            color: var(--caps-input-color-contrast, #000);
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
    const input = this.shadowRoot.querySelector('input');
    if (input) input.value = v;
  }
}

if (!customElements.get('caps-input')) {
  customElements.define('caps-input', CapsInput);
}

export { CapsInput };
