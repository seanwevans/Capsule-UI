class CapsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: var(--caps-card-bg, #fff);
          border: var(--caps-card-border, 1px solid #e5e7eb);
          border-radius: var(--caps-card-radius, 0.5rem);
          padding: var(--caps-card-padding, 1rem);
          box-shadow: var(--caps-card-shadow, 0 1px 2px rgba(0,0,0,0.05));
        }
      </style>
      <div class="card" part="card"><slot></slot></div>
    `;
  }
}

if (!customElements.get('caps-card')) {
  customElements.define('caps-card', CapsCard);
}

export { CapsCard };
