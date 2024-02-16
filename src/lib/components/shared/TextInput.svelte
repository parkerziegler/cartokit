<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  export let value: string;
  export let placeholder = '';
  export let id = '';

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: target.value });
  };

  const onFocus = () => {
    dispatch('focus', { focusing: true });
  };
</script>

<input
  {value}
  {placeholder}
  {id}
  on:change={onChange}
  on:focus={onFocus}
  class={cs(
    'border border-slate-600 bg-inherit bg-slate-900 p-2 hover:border-slate-400 focus:border-slate-400',
    className
  )}
/>
