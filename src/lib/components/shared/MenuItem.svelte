<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    containerClass?: string;
    titleClass?: string;
    action?: Snippet;
    children: Snippet;
  }

  let {
    title,
    containerClass = '',
    titleClass = '',
    action,
    children
  }: Props = $props();
</script>

<div
  class={[
    'flex flex-col gap-1 p-4 font-mono text-xs text-white',
    containerClass
  ]}
>
  {#if action}
    <div class={['flex items-center justify-between', titleClass]}>
      <p class="font-sans text-sm font-medium tracking-wider">
        {title}
      </p>
      {@render action?.()}
    </div>
  {:else}
    <p class="font-sans text-sm font-medium tracking-wider">
      {title}
    </p>
  {/if}
  {@render children()}
</div>
