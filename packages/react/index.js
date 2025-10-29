import { createElement, forwardRef, useEffect, useMemo, useRef } from 'react';
import '@capsule-ui/core';

const STANDARD_DOM_EVENTS = new Set([
  'animationcancel',
  'animationend',
  'animationiteration',
  'animationstart',
  'auxclick',
  'beforeinput',
  'blur',
  'cancel',
  'canplay',
  'canplaythrough',
  'change',
  'click',
  'close',
  'compositionend',
  'compositionstart',
  'compositionupdate',
  'contextmenu',
  'copy',
  'cuechange',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'focus',
  'focusin',
  'focusout',
  'fullscreenchange',
  'fullscreenerror',
  'gotpointercapture',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'lostpointercapture',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'paste',
  'pause',
  'play',
  'playing',
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerrawupdate',
  'pointerup',
  'progress',
  'ratechange',
  'reset',
  'resize',
  'scroll',
  'securitypolicyviolation',
  'seeked',
  'seeking',
  'select',
  'selectionchange',
  'selectstart',
  'slotchange',
  'stalled',
  'submit',
  'suspend',
  'timeupdate',
  'toggle',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'transitioncancel',
  'transitionend',
  'transitionrun',
  'transitionstart',
  'volumechange',
  'waiting',
  'wheel'
]);

const mergeRefs = (ref, node) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
};

const toKebabCase = (event) =>
  event
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const toEventNames = (propName, element) => {
  const event = propName.slice(2);
  if (!event) return [];
  const lower = event.toLowerCase();

  if (element && `on${lower}` in element) return [lower];
  if (typeof window !== 'undefined' && `on${lower}` in window) return [lower];
  if (STANDARD_DOM_EVENTS.has(lower)) return [lower];

  const names = new Set();
  if (event === lower) {
    names.add(event);
  } else {
    names.add(toKebabCase(event));
    names.add(event[0].toLowerCase() + event.slice(1));
  }
  return Array.from(names).filter(Boolean);
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
    const memoizedEventEntries = useMemo(() => eventEntries, eventDeps);

    const restDeps = Object.entries(rest).flat();
    const memoizedRest = useMemo(() => rest, restDeps);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const listeners = [];
      for (const [key, value] of memoizedEventEntries) {
        const events = toEventNames(key, el);
        for (const evt of events) {
          if (!evt) continue;
          el.addEventListener(evt, value);
          listeners.push([evt, value]);
        }
      }
      return () => {
        listeners.forEach(([evt, handler]) => {
          el.removeEventListener(evt, handler);
        });
      };
    }, [memoizedEventEntries]);

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
