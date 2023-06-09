<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();
  function click() {
    dispatch('click');
  }
</script>

<button
  on:click={click}
  class={cs(
    'rounded bg-slate-700 px-3 py-2 text-sm text-white transition-opacity hover:opacity-75',
    className
  )}><slot /></button
>
