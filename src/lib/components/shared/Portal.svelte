<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let target: HTMLElement = document.body;
  let ref: HTMLDivElement;
  let portal: HTMLDivElement;

  onMount(() => {
    portal = document.createElement('div');
    target.appendChild(portal);
    portal.appendChild(ref);
  });

  onDestroy(() => {
    target.removeChild(portal);
  });
</script>

<div class="hidden">
  <div bind:this={ref} class={$$props.class} style={$$props.style}>
    <slot />
  </div>
</div>
