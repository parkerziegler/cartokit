<script lang="ts">
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import PointSize from '$lib/components/point/PointSize.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitDotDensityLayer } from '$lib/types';

  export let layer: CartoKitDotDensityLayer;

  function onDotValueChange(event: CustomEvent<{ value: number }>) {
    dispatchLayerUpdate({
      type: 'dot-value',
      layerId: layer.id,
      payload: {
        value: event.detail.value
      }
    });
  }
</script>

<div class="stack stack-2xs">
  <AttributeSelect
    layerId={layer.id}
    geojson={layer.data.geojson}
    visualizationType="Quantitative"
    selected={layer.style.dots.attribute}
    channel="dots"
  />
  <PointSize
    layerId={layer.id}
    size={layer.style.dots.size}
    fieldId="dot-size"
    label="Dot Size"
  />
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="dot-value">Dot Value</FieldLabel>
    <NumberInput
      id="dot-value"
      min={1}
      max={Infinity}
      value={layer.style.dots.value}
      on:change={onDotValueChange}
      class="w-10"
    />
  </div>
</div>
