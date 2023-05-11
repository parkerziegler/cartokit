<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  export let id: string = '';
  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;
  export let value: number;
  export let disabled: boolean = false;

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

<style>
  input:disabled {
    @apply text-slate-400;
  }
</style>
