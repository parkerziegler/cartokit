<script lang="ts">
  import { on } from 'svelte/events';

  import { popup } from '$lib/state/popup.svelte';

  let cursorRef: HTMLDivElement;
  let interacting = $derived(Object.values(popup).some((p) => p.open));

  $effect(() => {
    const remove = on(window, 'mousemove', (event) => {
      cursorRef.style.left = `${event.clientX - 1}px`;
      cursorRef.style.top = `${event.clientY}px`;
    });

    return remove;
  });
</script>

<div
  class={[
    'pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80',
    interacting ? 'block' : 'hidden'
  ]}
  bind:this={cursorRef}
  id="cursor"
></div>
