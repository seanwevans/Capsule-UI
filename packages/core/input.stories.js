import './index.js';

export default {
  title: 'Core/Input',
  render: () => {
    const el = document.createElement('caps-input');
    el.setAttribute('placeholder', 'Type');
    return el;
  }
};
