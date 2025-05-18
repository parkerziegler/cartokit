<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    class?: string;
    target?: HTMLElement;
    style?: string;
    children: Snippet;
  }

  let {
    class: className,
    target = document.body,
    style,
    children
  }: Props = $props();

  let ref: HTMLDivElement;
  let portal: HTMLDivElement;

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
  <div bind:this={ref} class={className} {style}>
    {@render children()}
  </div>
</div>
