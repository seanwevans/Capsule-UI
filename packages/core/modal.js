import { withLocaleDir } from './withLocaleDir.js';
import { instrumentComponent } from './instrument.js';

class CapsModal extends withLocaleDir(HTMLElement) {
  static get observedAttributes() { return ['open', 'aria-label', 'aria-labelledby']; }

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
          contain: layout paint;
          content-visibility: auto;
        }
        :host([open]) { display: block; }
        .backdrop { position: absolute; inset: 0; background: var(--color-overlay); }
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-background);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          min-width: 300px;
          contain: layout paint;
          content-visibility: auto;
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
      if (e.key === 'Tab') {
        const modal = this.shadowRoot.querySelector('.modal');
        if (!modal) return;
        const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusables = [];
        const collectFocusables = (node) => {
          if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.(focusableSelector)) {
            focusables.push(node);
          }
          if (node.localName === 'slot') {
            const assigned = node.assignedElements?.({ flatten: true }) ?? [];
            assigned.forEach((el) => collectFocusables(el));
            return;
          }
          Array.from(node.children ?? []).forEach((child) => collectFocusables(child));
        };
        collectFocusables(modal);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        let activeElement = this.shadowRoot.activeElement;
        const isShadowActive = focusables.some((el) => el === activeElement || el?.contains?.(activeElement));
        if (!isShadowActive) {
          activeElement = document.activeElement;
        }
        const isFirstActive = first === activeElement || first?.contains?.(activeElement);
        const isLastActive = last === activeElement || last?.contains?.(activeElement);
        if (e.shiftKey && isFirstActive) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && isLastActive) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    this._onBackdropClick = () => this.removeAttribute('open');
  }

  connectedCallback() {
    super.connectedCallback();
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    backdrop?.addEventListener('click', this._onBackdropClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    backdrop?.removeEventListener('click', this._onBackdropClick);
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

instrumentComponent('caps-modal', CapsModal);

if (!customElements.get('caps-modal')) {
  customElements.define('caps-modal', CapsModal);
}

export { CapsModal };
