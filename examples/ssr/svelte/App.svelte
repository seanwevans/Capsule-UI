<script>
  import { CapsButton } from '@capsule-ui/svelte';
  export let message;
</script>

<CapsButton variant="ghost" aria-label={message}>{message}</CapsButton>
