<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types';
  import { percentToDecimal, decimalToPercent } from '$lib/utils/color';
  import { DEFAULT_OPACITY } from '$lib/utils/constants';

  export let layer: CartoKitLayer;
  export let property: 'fill' | 'stroke';

  $: opacity = decimalToPercent(
    layer.type === 'Line'
      ? layer.style.stroke.opacity
      : (layer.style[property]?.opacity ?? DEFAULT_OPACITY)
  );

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
    if (property === 'fill' && layer.type !== 'Line') {
      dispatchLayerUpdate({
        type: 'fill-opacity',
        layer,
        payload: { opacity }
      });
    } else {
      dispatchLayerUpdate({
        type: 'stroke-opacity',
        layer,
        payload: { opacity }
      });
    }
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="{property}-opacity-input">Opacity</FieldLabel>
  <input
    id="{property}-opacity-input"
    size="4"
    class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
    value={`${opacity}%`}
    on:change={validateOpacity}
  />
</div>
