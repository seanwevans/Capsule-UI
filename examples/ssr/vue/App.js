import { h } from 'vue';
import { CapsButton } from '@capsule-ui/vue';

export default {
  props: ['message'],
  render() {
    return h(CapsButton, { variant: 'ghost', 'aria-label': this.message }, this.message);
  }
};
