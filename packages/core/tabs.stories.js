import './index.js';

export default {
  title: 'Core/Tabs',
  render: () => {
    const el = document.createElement('caps-tabs');
    el.innerHTML = `
      <div slot="tab">One</div>
      <div slot="panel">First</div>
      <div slot="tab">Two</div>
      <div slot="panel">Second</div>
    `;
    return el;
  }
};
