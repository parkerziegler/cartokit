<script lang="ts">
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { decimalToPercent } from '$lib/utils/converters/decimal-to-percent';
  import { percentToDecimal } from '$lib/utils/converters/percent-to-decimal';

  interface Props {
    value: number;
    onchange: (value: number) => void;
    id?: string;
  }

  let { value, onchange, id }: Props = $props();

  function onOpacityChange(value: number) {
    onchange(percentToDecimal(value));
  }
</script>

<div class="flex items-center gap-1">
  <NumberInput
    {id}
    value={decimalToPercent(value)}
    onchange={onOpacityChange}
    min={0}
    max={100}
    class="w-10 text-right"
  />
  <span class="text-slate-400">%</span>
</div>
