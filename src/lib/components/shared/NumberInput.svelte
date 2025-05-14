<script lang="ts">
  interface Props {
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    value: number;
    disabled?: boolean;
    class?: string;
    autofocus?: boolean;
    onchange: (value: number) => void;
    ref?: HTMLInputElement;
  }

  let {
    id = '',
    min = 0,
    max = Infinity,
    step = 1,
    value,
    disabled = false,
    class: className = '',
    autofocus = false,
    onchange
  }: Props = $props();

  function onChange(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    const value = +event.currentTarget.value;

    if (Number.isNaN(value)) {
      return;
    }

    onchange(value);
  }
</script>

<!-- svelte-ignore a11y_autofocus -->
<input
  type="number"
  {id}
  {min}
  {max}
  {value}
  {step}
  {disabled}
  {autofocus}
  onchange={onChange}
  class={[
    'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
    className
  ]}
/>

<style lang="postcss">
  input:disabled {
    @apply text-slate-400;
  }
</style>
