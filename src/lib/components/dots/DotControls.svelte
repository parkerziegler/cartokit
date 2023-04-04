<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { map } from '$lib/stores/map';
  import { isDotDensityLayer } from '$lib/types/CartoKitLayer';

  $: size =
    $selectedLayer && isDotDensityLayer($selectedLayer)
      ? $selectedLayer.style.dots.size
      : 0;
  $: dotValue =
    $selectedLayer && isDotDensityLayer($selectedLayer)
      ? $selectedLayer.style.dots.value
      : 1;

  function onDotSizeChange(event: CustomEvent<{ value: number }>) {
    if ($selectedLayer && $map && isDotDensityLayer($selectedLayer)) {
      dispatchLayerUpdate({
        type: 'dot-size',
        map: $map,
        layer: $selectedLayer,
        payload: {
          size: event.detail.value
        }
      });
    }
  }

  function onDotValueChange(event: CustomEvent<{ value: number }>) {
    if ($selectedLayer && $map && isDotDensityLayer($selectedLayer)) {
      dispatchLayerUpdate({
        type: 'dot-value',
        map: $map,
        layer: $selectedLayer,
        payload: {
          value: event.detail.value
        }
      });
    }
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="Dot Size">Dot Size</FieldLabel>
  <NumberInput
    min={1}
    max={Infinity}
    value={size}
    on:change={onDotSizeChange}
  />
  <FieldLabel fieldId="Dot Value">Dot Value</FieldLabel>
  <NumberInput
    min={1}
    max={Infinity}
    value={dotValue}
    on:change={onDotValueChange}
  />
</div>
