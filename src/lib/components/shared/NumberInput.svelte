<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let min: number;
  export let max: number;
  export let size: number | undefined = undefined;
  export let value: number;

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
  {size}
  {value}
  on:change={onChange}
  class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
/>
