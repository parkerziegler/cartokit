<script lang="ts">
  import cs from 'classnames';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    titleClass?: string;
    action?: Snippet;
    children: Snippet;
  }

  let { title, titleClass = '', action, children }: Props = $props();
</script>

<div class="stack stack-2xs p-4 font-mono text-xs text-white">
  {#if action}
    <div class={cs('flex items-center justify-between', titleClass)}>
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
