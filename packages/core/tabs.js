import { getLocale, onLocaleChange } from './locale.js';

class CapsTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          container-type: inline-size;
        }
        .tablist { display: flex; gap: var(--spacing-xs); }
        .tablist ::slotted(button) {
          background: transparent;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          cursor: pointer;
          transition: background var(--motion-fast);
        }
        :host([variant="pill"]) .tablist ::slotted(button) {
          border-radius: 999px;
        }
        .tablist ::slotted(button[aria-selected='true']) {
          background: var(--color-background);
          font-weight: 600;
        }
        .panels {
          border: 1px solid var(--color-border);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          padding: var(--spacing-lg);
        }
        .panels ::slotted(*) { display: none; }
        .panels ::slotted([data-active]) { display: block; }
        @container (max-width: 480px) {
          .tablist { flex-direction: column; }
          .tablist ::slotted(button) { border-radius: var(--radius-md); }
        }
        @media (prefers-reduced-motion: reduce) {
          :host { --motion-fast: 0s; }
        }
        @media (prefers-contrast: more) {
          .tablist ::slotted(button[aria-selected='true']) {
            background: var(--color-text);
            color: var(--color-background);
          }
        }
      </style>
      <div class="tabs">
        <div class="tablist" part="tablist" role="tablist"><slot name="tab"></slot></div>
        <div class="panels" part="panels"><slot name="panel"></slot></div>
      </div>
    `;
  }

  connectedCallback() {
    const tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
    const panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
    const handlers = new WeakMap();
    const keyHandlers = new WeakMap();
    const assign = () => {
      const tabs = tabSlot.assignedElements();
      const panels = panelSlot.assignedElements();
      const dir = this.getAttribute('dir') || getLocale().dir;
      const isRtl = dir === 'rtl';
      tabs.forEach((tab, i) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('tabindex', i === 0 ? '0' : '-1');
        tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        const panel = panels[i];
        if (panel) {
          if (!panel.id) panel.id = `caps-panel-${i}`;
          tab.setAttribute('aria-controls', panel.id);
        }
        const existingClick = handlers.get(tab);
        if (existingClick) tab.removeEventListener('click', existingClick);
        const clickHandler = () => {
          tabs.forEach((t, idx) => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
            panels[idx]?.removeAttribute('data-active');
          });
          tab.setAttribute('aria-selected', 'true');
          tab.setAttribute('tabindex', '0');
          panel?.setAttribute('data-active', '');
          tab.focus();
        };
        tab.addEventListener('click', clickHandler);
        handlers.set(tab, clickHandler);
        const existingKey = keyHandlers.get(tab);
        if (existingKey) tab.removeEventListener('keydown', existingKey);
        const keyHandler = (e) => {
          const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
          if (!keys.includes(e.key)) return;
          e.preventDefault();
          let idx = tabs.indexOf(tab);
          if (e.key === 'ArrowRight') idx = isRtl ? idx - 1 : idx + 1;
          if (e.key === 'ArrowLeft') idx = isRtl ? idx + 1 : idx - 1;
          if (e.key === 'Home') idx = 0;
          if (e.key === 'End') idx = tabs.length - 1;
          if (idx < 0) idx = tabs.length - 1;
          if (idx >= tabs.length) idx = 0;
          tabs[idx].click();
        };
        tab.addEventListener('keydown', keyHandler);
        keyHandlers.set(tab, keyHandler);
      });
      panels.forEach((p, i) => {
        p.setAttribute('role', 'tabpanel');
        if (i === 0) p.setAttribute('data-active', '');
      });
    };
    tabSlot.addEventListener('slotchange', assign);
    panelSlot.addEventListener('slotchange', assign);
    assign();
    if (!this.hasAttribute('dir')) {
      this.setAttribute('dir', getLocale().dir);
      this._unsub = onLocaleChange((loc) => {
        if (!this.hasAttribute('dir')) this.setAttribute('dir', loc.dir);
        assign();
      });
    }
  }

  disconnectedCallback() {
    this._unsub?.();
  }
}

if (!customElements.get('caps-tabs')) {
  customElements.define('caps-tabs', CapsTabs);
}

export { CapsTabs };
