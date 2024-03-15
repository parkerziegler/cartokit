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

  let widthMachine: HTMLSpanElement;
  let input: HTMLInputElement;

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: +target.value });
  }

  const onKeyUp = () => {
    widthMachine.innerHTML = input.value;
  };
</script>

<span class="relative h-8">
  <span class="px-4" aria-hidden="true" bind:this={widthMachine}> </span>
  <input
    type="number"
    {id}
    {min}
    {max}
    {value}
    {step}
    {disabled}
    on:change={onChange}
    bind:this={input}
    on:keyup={onKeyUp}
    class={cs(
      'absolute left-0 w-full border border-transparent bg-slate-900 p-2 text-center hover:border-slate-600 focus:border-slate-600',
      className
    )}
  />
</span>

<style>
  input:disabled {
    @apply text-slate-400;
  }
</style>
