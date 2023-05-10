<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { percentToDecimal, decimalToPercent } from '$lib/utils/color';

  export let opacity: number;
  export let onOpacityChange: (opacity: number) => void;
  export let property: 'fill' | 'stroke';

  function validateOpacity(event: Event) {
    const target = event.target as HTMLInputElement;
    let output = target.value;

    if (output.endsWith('%')) {
      output = output.replace('%', '');
    }

    if (Number.isNaN(+output)) {
      onOpacityChange(1);
    } else {
      onOpacityChange(percentToDecimal(Math.min(100, Math.max(0, +output))));
    }
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="opacity">Opacity</FieldLabel>
  <input
    id={`${property}-opacity`}
    size="4"
    class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
    value={`${decimalToPercent(opacity)}%`}
    on:change={validateOpacity}
  />
</div>
