<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  export let value: string;
  export let placeholder = '';
  export let id = '';

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: target.value });
  }
</script>

<input
  {value}
  {placeholder}
  {id}
  on:change={onChange}
  class={cs(
    'border border-slate-700 bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
    className
  )}
/>
