import { instrumentComponent } from './instrument.js';

class CapsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          container-type: inline-size;
        }
        .card {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }
        :host([variant="outline"]) .card { box-shadow: none; }
        :host([variant="ghost"]) .card {
          background: transparent;
          border: none;
          box-shadow: none;
        }
        :host([size="compact"]) .card { padding: var(--spacing-md); }
        @container (min-width: 600px) {
          .card { padding: calc(var(--spacing-lg) * 1.5); }
          :host([size="compact"]) .card { padding: var(--spacing-lg); }
        }
      </style>
      <div class="card" part="card"><slot></slot></div>
    `;
  }
}
instrumentComponent('caps-card', CapsCard);

if (!customElements.get('caps-card')) {
  customElements.define('caps-card', CapsCard);
}

export { CapsCard };
