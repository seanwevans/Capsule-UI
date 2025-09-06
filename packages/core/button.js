import { withLocaleDir } from './withLocaleDir.js';
import { instrumentComponent } from './instrument.js';

const css = `
  :host {
    display: inline-block;
    container-type: inline-size;
  }

  button {
    font: inherit;
    padding: var(--spacing-sm) var(--spacing-lg);
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-brand);
    color: var(--color-text);
    transition: background var(--motion-fast), color var(--motion-fast);
  }
  :host([variant="outline"]) button {
    background: transparent;
    border: 1px solid var(--color-brand);
    color: var(--color-brand);
  }
  @container (min-width: 480px) {
    button { padding: var(--spacing-md) var(--spacing-xl); }
  }
  button:focus-visible { outline: 2px solid var(--color-text); outline-offset: 2px; }
  button[disabled] { opacity: 0.6; cursor: not-allowed; }
  @media (prefers-reduced-motion: reduce) {
    :host { --motion-fast: 0s; }
  }
  @media (prefers-contrast: more) {
    button {
      background: var(--color-text);
      color: var(--color-background);
    }
  }
`;

class CapsButton extends withLocaleDir(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const sheet = globalThis.__capsuleSheets?.get?.('caps-button');
    if (sheet) {
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = `<button part="button" type="button"><slot></slot></button>`;
    } else {
      this.shadowRoot.innerHTML = `<style>${css}</style><button part="button" type="button"><slot></slot></button>`;
    }
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

instrumentComponent('caps-button', CapsButton);

if (!customElements.get('caps-button')) {
  customElements.define('caps-button', CapsButton);
}

export { CapsButton };
