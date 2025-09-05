import React from 'react';
import { CapsButton } from '@capsule-ui/react';

export function App({ message }) {
  return React.createElement(
    CapsButton,
    { variant: 'ghost', 'aria-label': message },
    message
  );
}
