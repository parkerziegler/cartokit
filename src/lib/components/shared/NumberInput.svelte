<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;
  export let value: number;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: +target.value });
  }
</script>

<input
  type="number"
  {min}
  {max}
  {value}
  {step}
  {disabled}
  on:change={onChange}
  class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600 {$$props.class}"
/>

<style>
  input:disabled {
    @apply text-slate-400;
  }
</style>
