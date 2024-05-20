<script lang="ts">
  import cs from 'classnames';

  import { clickOutside } from '$lib/utils/actions';

  let className = '';
  export { className as class };
  export let id = '';
  export let onClickOutside: (
    event: CustomEvent<MouseEvent>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => void = () => {};
</script>

<div
  {id}
  class={cs('stack-border rounded-md bg-slate-900 shadow-lg', className)}
  use:clickOutside
  on:clickoutside={onClickOutside}
>
  <slot />
</div>
