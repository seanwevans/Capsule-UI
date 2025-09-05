import { createElement, forwardRef } from 'react';
import '@capsule-ui/core';

const createComponent = (tag) =>
  forwardRef(({ children, ...rest }, ref) =>
    createElement(tag, { ...rest, ref }, children)
  );

export const CapsButton = createComponent('caps-button');
export const CapsInput = createComponent('caps-input');
export const CapsCard = createComponent('caps-card');
export const CapsTabs = createComponent('caps-tabs');
export const CapsModal = createComponent('caps-modal');
