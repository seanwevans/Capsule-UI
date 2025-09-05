class CapsTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .tablist { display: flex; gap: 0.25rem; }
        .tablist ::slotted(button) {
          background: var(--caps-tab-bg, transparent);
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem 0.375rem 0 0;
          cursor: pointer;
        }
        .tablist ::slotted(button[aria-selected='true']) {
          background: var(--caps-tab-active-bg, #fff);
          font-weight: 600;
        }
        .panels { border: 1px solid var(--caps-tab-border, #e5e7eb); border-radius: 0 0 0.375rem 0.375rem; padding: 1rem; }
        .panels ::slotted(*) { display: none; }
        .panels ::slotted([data-active]) { display: block; }
      </style>
      <div class="tabs">
        <div class="tablist" part="tablist"><slot name="tab"></slot></div>
        <div class="panels" part="panels"><slot name="panel"></slot></div>
      </div>
    `;
  }

  connectedCallback() {
    const tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
    const panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
    const assign = () => {
      const tabs = tabSlot.assignedElements();
      const panels = panelSlot.assignedElements();
      tabs.forEach((tab, i) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
          panels.forEach(p => p.removeAttribute('data-active'));
          tab.setAttribute('aria-selected', 'true');
          panels[i]?.setAttribute('data-active', '');
        });
      });
      panels.forEach((p, i) => {
        p.setAttribute('role', 'tabpanel');
        if (i === 0) p.setAttribute('data-active', '');
      });
    };
    tabSlot.addEventListener('slotchange', assign);
    panelSlot.addEventListener('slotchange', assign);
    assign();
  }
}

if (!customElements.get('caps-tabs')) {
  customElements.define('caps-tabs', CapsTabs);
}

export { CapsTabs };
