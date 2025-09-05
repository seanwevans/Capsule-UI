import '@capsule-ui/core';
import { defineComponent, h } from 'vue';

const createComponent = (tag, name) =>
  defineComponent({
    name,
    setup(props, { slots, attrs }) {
      return () => h(tag, { ...attrs, ...props }, slots.default ? slots.default() : undefined);
    }
  });

export const CapsButton = createComponent('caps-button', 'CapsButton');
export const CapsInput = createComponent('caps-input', 'CapsInput');
export const CapsCard = createComponent('caps-card', 'CapsCard');
export const CapsTabs = createComponent('caps-tabs', 'CapsTabs');
export const CapsModal = createComponent('caps-modal', 'CapsModal');
