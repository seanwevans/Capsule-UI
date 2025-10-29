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

    const eventEntries = Object.entries(eventHandlers);
    const eventDeps = eventEntries.flat();
    const memoizedEventListeners = useMemo(
      () => eventEntries.map(([key, handler]) => [key.slice(2).toLowerCase(), handler]),
      eventDeps
    );

    const restDeps = Object.entries(rest).flat();
    const memoizedRest = useMemo(() => rest, restDeps);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      memoizedEventListeners.forEach(([evt, handler]) => {
        el.addEventListener(evt, handler);
      });
      return () => {
        memoizedEventListeners.forEach(([evt, handler]) => {
          el.removeEventListener(evt, handler);
        });
      };
    }, [memoizedEventListeners]);

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
