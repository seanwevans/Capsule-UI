import '@capsule-ui/core';
import { defineComponent, h } from 'vue';

const createComponent = (tag, name) =>
  defineComponent({
    name,
    setup(props, { slots, attrs }) {
      return () => h(tag, { ...attrs, ...props }, slots.default ? slots.default() : undefined);
    }
  });
const components = [
  ['caps-button', 'CapsButton'],
  ['caps-input', 'CapsInput'],
  ['caps-card', 'CapsCard'],
  ['caps-tabs', 'CapsTabs'],
  ['caps-modal', 'CapsModal'],
  ['caps-select', 'CapsSelect']
];

export const {
  CapsButton,
  CapsInput,
  CapsCard,
  CapsTabs,
  CapsModal,
  CapsSelect
} = components.reduce((acc, [tag, name]) => {
  acc[name] = createComponent(tag, name);
  return acc;
}, {});
