import { h } from 'vue';

export default {
  props: ['message'],
  render() {
    return h('h1', this.message);
  }
};
