<script lang="ts">
  import { validateRange } from '$lib/utils/validators/range';

  interface Props {
    value: number;
    onchange: (value: number) => void;
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    class?: string;
  }

  let {
    value,
    onchange,
    id,
    min = -Infinity,
    max = Infinity,
    step = 1,
    disabled = false,
    class: className = ''
  }: Props = $props();

  function onChange(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    const input = parseFloat(event.currentTarget.value);
    value = validateRange(input, min, max);

    onchange(value);
  }

  function onKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    if (event.key === 'ArrowUp') {
      const input = parseFloat(event.currentTarget.value);
      value = validateRange(input + step, min, max);

      onchange(value);
    } else if (event.key === 'ArrowDown') {
      const input = parseFloat(event.currentTarget.value);
      value = validateRange(input - step, min, max);

      onchange(value);
    }
  }
</script>

<input
  type="text"
  inputmode="numeric"
  pattern="[0-9]*"
  bind:value
  {id}
  {disabled}
  onkeydown={onKeyDown}
  onchange={onChange}
  class={[
    'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
    className
  ]}
/>

<style lang="postcss">
  @reference 'tailwindcss';

  input:disabled {
    @apply text-slate-400;
  }
</style>
