import { getLocale, onLocaleChange } from './locale.js';

class CapsButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          container-type: inline-size;
        }
        button {
          font: inherit;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          background: var(--caps-btn-bg, #4f46e5);
          color: var(--caps-btn-color, #fff);
        }
        :host([variant="outline"]) button {
          background: transparent;
          border: 1px solid var(--caps-btn-bg, #4f46e5);
          color: var(--caps-btn-bg, #4f46e5);
        }
        @container (min-width: 480px) {
          button { padding: 0.75rem 1.25rem; }
        }
        button:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
        button[disabled] { opacity: 0.6; cursor: not-allowed; }
      </style>
      <button part="button" type="button"><slot></slot></button>
    `;
  }

  static get observedAttributes() {
    return ['disabled', 'type', 'aria-label', 'aria-haspopup', 'aria-expanded', 'role'];
  }

  attributeChangedCallback(name, _old, value) {
    const btn = this.shadowRoot.querySelector('button');
    if (!btn) return;
    if (name === 'disabled') {
      btn.toggleAttribute('disabled', value !== null);
      btn.setAttribute('aria-disabled', value !== null ? 'true' : 'false');
    } else if (name === 'type') {
      btn.setAttribute('type', value || 'button');
    } else if (name.startsWith('aria-') || name === 'role') {
      if (value !== null) btn.setAttribute(name, value);
      else btn.removeAttribute(name);
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
    this.shadowRoot.querySelector('button')?.focus();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }
}

if (!customElements.get('caps-button')) {
  customElements.define('caps-button', CapsButton);
}

export { CapsButton };
