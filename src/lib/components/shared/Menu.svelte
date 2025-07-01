<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  import { clickoutside } from '$lib/utils/actions';

  interface Props {
    class?: ClassValue;
    style?: string;
    id?: string;
    onclickoutsidemenu?: (event: CustomEvent<MouseEvent>) => void;
    children: Snippet;
  }

  let {
    class: className = '',
    id = '',
    onclickoutsidemenu = () => {},
    children
  }: Props = $props();
</script>

<div
  {id}
  class={['stack-border menu rounded-md bg-slate-900 shadow-lg', className]}
  use:clickoutside
  onclickoutside={onclickoutsidemenu}
>
  {@render children()}
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  :global(.menu > * + *) {
    @apply border-t border-t-slate-400;
  }
</style>
