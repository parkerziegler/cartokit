<script lang="ts">
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import FunctionIcon from '$lib/components/icons/FunctionIcon.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    active: boolean;
  }

  let { active = $bindable(false) }: Props = $props();

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('f', toggleTransformData);

    return deregisterKeybinding;
  });

  function toggleTransformData() {
    active = !active;
  }
</script>

<button
  class={['transition-colors', { 'text-ck-light': active }]}
  onclick={toggleTransformData}
  data-testid="transform-data-button"
  {@attach tooltip({
    content: 'Transform Data',
    keybinding: 'F',
    placement: 'bottom'
  })}
>
  <FunctionIcon />
</button>
