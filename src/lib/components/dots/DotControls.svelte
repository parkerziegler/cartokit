<script lang="ts">
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitDotDensityLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitDotDensityLayer;

  $: size = layer.style.dots.size;
  $: dotValue = layer.style.dots.value;

  function onDotSizeChange(event: CustomEvent<{ value: number }>) {
    dispatchLayerUpdate({
      type: 'dot-size',
      layer,
      payload: {
        size: event.detail.value
      }
    });
  }

  function onDotValueChange(event: CustomEvent<{ value: number }>) {
    dispatchLayerUpdate({
      type: 'dot-value',
      layer,
      payload: {
        value: event.detail.value
      }
    });
  }
</script>

<div class="stack stack-xs">
  <AttributeSelect {layer} selected={layer.style.dots.attribute} />
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="Dot Size">Dot Size</FieldLabel>
    <NumberInput
      min={1}
      max={Infinity}
      value={size}
      on:change={onDotSizeChange}
    />
  </div>
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="Dot Value">Dot Value</FieldLabel>
    <NumberInput
      min={1}
      max={Infinity}
      value={dotValue}
      on:change={onDotValueChange}
    />
  </div>
</div>
