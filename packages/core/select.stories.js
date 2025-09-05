import './index.js';

export default {
  title: 'Core/Select',
  render: () => {
    const el = document.createElement('caps-select');
    el.innerHTML = '<option>One</option><option>Two</option>';
    return el;
  }
};
