export const registry = (globalThis.__capsuleSheets ||= new Map());

class CapsuleStyle extends HTMLLinkElement {
  connectedCallback() {
    const module = this.getAttribute('data-module');
    if (!module) return;

    const register = () => {
      registry.set(module, this.sheet);
    };

    if (this.sheet) {
      register();
    } else {
      this.addEventListener('load', register, { once: true });
    }
  }
}

customElements.define('capsule-style', CapsuleStyle, { extends: 'link' });
