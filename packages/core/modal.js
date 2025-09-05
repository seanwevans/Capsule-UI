import { getLocale, onLocaleChange } from './locale.js';

class CapsModal extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          inset: 0;
          container-type: inline-size;
        }
        :host([open]) { display: block; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--caps-modal-bg, #fff);
          padding: 1rem;
          border-radius: 0.5rem;
          min-width: 300px;
        }
        :host([variant="fullscreen"]) .modal {
          inset: 0;
          top: 0;
          left: 0;
          transform: none;
          width: 100%;
          height: 100%;
          border-radius: 0;
        }
        @container (min-width: 600px) {
          .modal { min-width: 500px; }
        }
      </style>
      <div class="backdrop" part="backdrop"></div>
      <div class="modal" part="modal" role="dialog" aria-modal="true" tabindex="-1"><slot></slot></div>
    `;
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.removeAttribute('open');
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
    }
  }
}

if (!customElements.get('caps-modal')) {
  customElements.define('caps-modal', CapsModal);
}

export { CapsModal };
