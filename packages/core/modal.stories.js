import './index.js';

export default {
  title: 'Core/Modal',
  render: () => {
    const el = document.createElement('caps-modal');
    el.setAttribute('open', '');
    el.textContent = 'Modal content';
    return el;
  }
};
