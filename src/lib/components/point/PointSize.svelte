<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitPointLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitPointLayer | CartoKitDotDensityLayer;

  const onPointSizeChange = (event: CustomEvent<{ value: number }>): void => {
    dispatchLayerUpdate({
      type: 'point-size',
      layer,
      payload: {
        size: event.detail.value
      }
    });
  };

  $: ({ size, fieldId, label } =
    layer.type === 'Point'
      ? { size: layer.style.size, fieldId: 'point-size', label: 'Point Size' }
      : {
          size: layer.style.dots.size,
          fieldId: 'dot-size',
          label: 'Dot Size'
        });
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel {fieldId}>{label}</FieldLabel>
  <NumberInput
    id={fieldId}
    min={1}
    max={Infinity}
    value={size}
    on:change={onPointSizeChange}
  />
</div>
