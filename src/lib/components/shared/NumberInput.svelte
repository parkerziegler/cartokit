<script lang="ts">
  import cs from 'classnames';

  interface Props {
    id?: string;
    min?: number;
    max?: any;
    step?: number;
    value: number;
    disabled?: boolean;
    class?: string;
    onChange: (
      event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) => void;
  }

  let {
    id = '',
    min = 0,
    max = Infinity,
    step = 1,
    value,
    disabled = false,
    class: className = '',
    onChange
  }: Props = $props();
</script>

<input
  type="number"
  {id}
  {min}
  {max}
  {value}
  {step}
  {disabled}
  onchange={onChange}
  class={cs(
    'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
    className
  )}
/>

<style lang="postcss">
  input:disabled {
    @apply text-slate-400;
  }
</style>
