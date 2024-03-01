<script lang="ts">
  import { onMount } from 'svelte';

  export let target: HTMLElement = document.body;
  let ref: HTMLDivElement;
  let portal: HTMLDivElement;

  let className = '';
  export { className as class };

  onMount(() => {
    portal = document.createElement('div');
    target.appendChild(portal);
    portal.appendChild(ref);

    return () => {
      target.removeChild(portal);
    };
  });
</script>

<div class="hidden">
  <div bind:this={ref} class={className} style={$$props.style}>
    <slot />
  </div>
</div>
