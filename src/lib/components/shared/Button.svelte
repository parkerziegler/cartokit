<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  let className = '';
  export { className as class };
  export let disabled = false;

  const dispatch = createEventDispatcher();
  const onClick = () => {
    dispatch('click');
  };
</script>

<button
  on:click={onClick}
  {disabled}
  class={cs(
    'rounded bg-slate-700 px-3 py-2 text-sm text-white transition-opacity enabled:hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:cursor-not-allowed',
    className
  )}><slot /></button
>
