<script lang="ts">
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

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

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    dispatch('input', { value: target.value });
  };
</script>

<input
  {value}
  {placeholder}
  {id}
  on:change={onChange}
  on:focus={onFocus}
  on:input={onInput}
  class={cs(
    'border border-slate-600 bg-inherit bg-slate-900 p-2 hover:border-slate-400 focus:border-slate-400',
    className
  )}
/>
