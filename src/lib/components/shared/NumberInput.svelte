<script lang="ts">
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let min = 0;
  export let max = Infinity;
  export let step = 1;
  export let value: number;
  export let disabled = false;

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: +target.value });
  }
</script>

<input
  type="number"
  {id}
  {min}
  {max}
  {value}
  {step}
  {disabled}
  on:change={onChange}
  class={cs(
    'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
    className
  )}
/>

<style lang="postcss">
  input:disabled {
    @apply text-slate-400;
  }
</style>
