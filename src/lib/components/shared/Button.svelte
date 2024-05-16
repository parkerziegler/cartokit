<script lang="ts">
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

  let className = '';
  export { className as class };
  export let disabled = false;
  export let testId = '';

  const dispatch = createEventDispatcher();

  function onClick() {
    dispatch('click');
  }
</script>

<button
  on:click={onClick}
  {disabled}
  class={cs(
    'rounded bg-slate-700 px-3 py-2 text-sm text-white transition-opacity enabled:hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:cursor-not-allowed',
    className
  )}
  data-testid={testId || undefined}><slot /></button
>
