<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let ref: HTMLDivElement;
  let portal: HTMLDivElement;

  onMount(() => {
    portal = document.createElement('div');
    document.body.appendChild(portal);
    portal.appendChild(ref);
  });

  onDestroy(() => {
    document.body.removeChild(portal);
  });
</script>

<div class="hidden">
  <div bind:this={ref} class={$$props.class}>
    <slot />
  </div>
</div>
