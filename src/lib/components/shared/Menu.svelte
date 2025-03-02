<script lang="ts">
  import cs from 'classnames';
  import type { Snippet } from 'svelte';

  import { clickoutside } from '$lib/utils/actions';

  interface Props {
    class?: string;
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
  class={cs('stack-border rounded-md bg-slate-900 shadow-lg', className)}
  use:clickoutside
  onclickoutside={onclickoutsidemenu}
>
  {@render children()}
</div>
