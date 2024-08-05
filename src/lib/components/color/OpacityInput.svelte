<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CategoricalStyle,
    ConstantStyle,
    QuantitativeStyle
  } from '$lib/types';
  import { percentToDecimal, decimalToPercent } from '$lib/utils/color';

  export let layerId: string;
  export let property: 'fill' | 'stroke';
  export let style: QuantitativeStyle | CategoricalStyle | ConstantStyle;

  $: opacity = decimalToPercent(style.opacity);

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

  function onOpacityChange(opacity: number) {
    dispatchLayerUpdate({
      type: `${property}-opacity`,
      layerId,
      payload: { opacity }
    });
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="{property}-opacity-input">Opacity</FieldLabel>
  <input
    id="{property}-opacity-input"
    size="4"
    class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
    value="{opacity}%"
    on:change={validateOpacity}
  />
</div>
