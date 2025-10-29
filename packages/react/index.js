import { createElement, forwardRef, useEffect, useMemo, useRef } from 'react';
import '@capsule-ui/core';

const mergeRefs = (ref, node) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
};

const createComponent = (tag) =>
  forwardRef(({ children, ...props }, forwardedRef) => {
    const innerRef = useRef(null);

    const eventHandlers = {};
    const rest = {};
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        eventHandlers[key] = value;
      } else {
        rest[key] = value;
      }
    }

    const restDeps = Object.entries(rest).flat();
    const memoizedRest = useMemo(() => rest, restDeps);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const listeners = [];
      for (const [key, value] of Object.entries(eventHandlers)) {
        const eventName = key.slice(2);
        const evt =
          eventName.length > 0
            ? eventName[0].toLowerCase() + eventName.slice(1)
            : eventName;
        el.addEventListener(evt, value);
        listeners.push([evt, value]);
      }
      return () => {
        listeners.forEach(([e, fn]) => el.removeEventListener(e, fn));
      };
    }, Object.values(eventHandlers));

    return createElement(tag, {
      ...memoizedRest,
      ref: (node) => {
        innerRef.current = node;
        mergeRefs(forwardedRef, node);
      }
    }, children);
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
  acc[name] = createComponent(tag);
  return acc;
}, {});
