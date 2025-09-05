import './index.js';

export default {
  title: 'Core/Card',
  render: () => {
    const el = document.createElement('caps-card');
    el.textContent = 'Card content';
    return el;
  }
};
