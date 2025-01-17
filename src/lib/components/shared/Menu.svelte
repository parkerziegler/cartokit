<script lang="ts">
  import cs from 'classnames';
  import type { Snippet } from 'svelte';

  import { clickOutside } from '$lib/utils/actions';

  interface Props {
    class?: string;
    id?: string;
    onClickOutside?: (event: CustomEvent<MouseEvent>) => void;
    children: Snippet;
  }

  let {
    class: className = '',
    id = '',
    onClickOutside = () => {},
    children
  }: Props = $props();
</script>

<div
  {id}
  class={cs('stack-border rounded-md bg-slate-900 shadow-lg', className)}
  use:clickOutside
  onclickoutside={onClickOutside}
>
  {@render children()}
</div>
