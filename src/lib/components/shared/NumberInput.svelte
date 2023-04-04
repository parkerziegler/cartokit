<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let min: number;
  export let max: number;
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
  {value}
  on:change={onChange}
  class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600 {$$props.class}"
  class:w-6={value.toString().length === 1}
  class:w-8={value.toString().length === 2}
  class:w-10={value.toString().length === 3}
  class:w-12={value.toString().length >= 4}
/>
