import { createElement, forwardRef, useEffect, useRef } from 'react';
import '@capsule-ui/core';

const mergeRefs = (ref, node) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
};

const createComponent = (tag) =>
  forwardRef(({ children, ...props }, forwardedRef) => {
    const innerRef = useRef(null);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const listeners = [];
      for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on') && typeof value === 'function') {
          const evt = key.slice(2).toLowerCase();
          el.addEventListener(evt, value);
          listeners.push([evt, value]);
        }
      }
      return () => {
        listeners.forEach(([e, fn]) => el.removeEventListener(e, fn));
      };
    }, [props]);

    const rest = {};
    for (const [key, value] of Object.entries(props)) {
      if (!(key.startsWith('on') && typeof value === 'function')) {
        rest[key] = value;
      }
    }

    return createElement(tag, {
      ...rest,
      ref: (node) => {
        innerRef.current = node;
        mergeRefs(forwardedRef, node);
      }
    }, children);
  });

export const CapsButton = createComponent('caps-button');
export const CapsInput = createComponent('caps-input');
export const CapsCard = createComponent('caps-card');
export const CapsTabs = createComponent('caps-tabs');
export const CapsModal = createComponent('caps-modal');
export const CapsSelect = createComponent('caps-select');
