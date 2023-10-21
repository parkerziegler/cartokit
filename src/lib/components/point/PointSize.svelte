<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitPointLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitPointLayer | CartoKitDotDensityLayer;

  const onDotSizeChange = (event: CustomEvent<{ value: number }>): void => {
    dispatchLayerUpdate({
      type: 'point-size',
      layer,
      payload: {
        size: event.detail.value
      }
    });
  };

  $: size = layer.type === 'Point' ? layer.style.size : layer.style.dots.size;
  $: fieldId = layer.type === 'Point' ? 'point-size' : 'dot-size';
  $: label = layer.type === 'Point' ? 'Point Size' : 'Dot Size';
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel {fieldId}>{label}</FieldLabel>
  <NumberInput
    id={fieldId}
    min={1}
    max={Infinity}
    value={size}
    on:change={onDotSizeChange}
  />
</div>
