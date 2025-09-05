import { getLocale, onLocaleChange } from './locale.js';

class CapsModal extends HTMLElement {
  static get observedAttributes() { return ['open', 'aria-label', 'aria-labelledby']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; position: fixed; inset: 0; --caps-motion: 0.2s; }
        :host([open]) { display: block; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--caps-modal-bg, #fff); padding: 1rem; border-radius: 0.5rem; min-width: 300px; transition: transform var(--caps-motion); }
        @media (prefers-reduced-motion: reduce) {
          :host { --caps-motion: 0s; }
        }
        @media (prefers-contrast: more) {
          .backdrop { background: rgba(0,0,0,0.8); }
          .modal { background: var(--caps-modal-bg-contrast, #fff); color: var(--caps-modal-color-contrast, #000); }
        }
      </style>
      <div class="backdrop" part="backdrop"></div>
      <div class="modal" part="modal" role="dialog" aria-modal="true" tabindex="-1"><slot></slot></div>
    `;
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.removeAttribute('open');
      if (e.key === 'Tab') {
        const focusables = this.shadowRoot.querySelectorAll('.modal a[href], .modal button:not([disabled]), .modal textarea:not([disabled]), .modal input:not([disabled]), .modal select:not([disabled]), .modal [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
  }

  connectedCallback() {
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    backdrop?.addEventListener('click', () => this.removeAttribute('open'));
    if (!this.hasAttribute('dir')) {
      this.setAttribute('dir', getLocale().dir);
      this._unsub = onLocaleChange((loc) => {
        if (!this.hasAttribute('dir')) this.setAttribute('dir', loc.dir);
      });
    }
  }

  disconnectedCallback() {
    this._unsub?.();
    document.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback(name, _old, value) {
    if (name === 'open') {
      const modal = this.shadowRoot.querySelector('.modal');
      if (value !== null) {
        this._previous = document.activeElement;
        modal?.focus();
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        document.removeEventListener('keydown', this._onKeyDown);
        this._previous?.focus();
      }
    } else if (name === 'aria-label' || name === 'aria-labelledby') {
      const modal = this.shadowRoot.querySelector('.modal');
      if (value !== null) modal.setAttribute(name, value);
      else modal.removeAttribute(name);
    }
  }
}

if (!customElements.get('caps-modal')) {
  customElements.define('caps-modal', CapsModal);
}

export { CapsModal };
