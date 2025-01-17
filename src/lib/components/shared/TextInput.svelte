<script lang="ts">
  import cs from 'classnames';
  import type { FormEventHandler } from 'svelte/elements';

  interface Props {
    value: string;
    oninput?: FormEventHandler<HTMLInputElement>;
    placeholder?: string;
    id?: string;
    class?: string;
  }

  let {
    value,
    oninput = () => {},
    placeholder = '',
    id = '',
    class: className = ''
  }: Props = $props();
</script>

<input
  {value}
  {placeholder}
  {id}
  {oninput}
  class={cs(
    'border border-slate-600 bg-inherit bg-slate-900 p-2 hover:border-slate-400 focus:border-slate-400',
    className
  )}
/>
