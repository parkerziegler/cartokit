<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  import { onClickOutside } from '$lib/attachments/on-click-outside';

  interface Props {
    class?: ClassValue;
    style?: string;
    id?: string;
    onclickoutsidemenu?: (event: MouseEvent) => void;
    ref?: HTMLDivElement;
    children: Snippet;
  }

  let {
    class: className = '',
    id = '',
    onclickoutsidemenu = () => {},
    ref = $bindable(undefined),
    children
  }: Props = $props();
</script>

<div
  {id}
  class={['menu rounded bg-slate-900 shadow-lg', className]}
  {@attach onClickOutside({ callback: onclickoutsidemenu })}
  bind:this={ref}
>
  {@render children()}
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  :global(.menu > * + *) {
    @apply border-t border-t-slate-600;
  }
</style>
