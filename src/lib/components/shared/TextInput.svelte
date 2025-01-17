<script lang="ts">
  import cs from 'classnames';

  interface Props {
    value: string;
    onChange?: (
      event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) => void;
    onFocus?: (
      event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) => void;
    onInput?: (
      event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) => void;
    placeholder?: string;
    id?: string;
    class?: string;
  }

  let {
    value,
    onChange = () => {},
    onFocus = () => {},
    onInput = () => {},
    placeholder = '',
    id = '',
    class: className = ''
  }: Props = $props();
</script>

<input
  {value}
  {placeholder}
  {id}
  onchange={onChange}
  onfocus={onFocus}
  oninput={onInput}
  class={cs(
    'border border-slate-600 bg-inherit bg-slate-900 p-2 hover:border-slate-400 focus:border-slate-400',
    className
  )}
/>
