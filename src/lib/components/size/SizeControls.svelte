<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { map } from '$lib/stores/map';
  import { isProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

  $: min =
    $selectedLayer && isProportionalSymbolLayer($selectedLayer)
      ? $selectedLayer.style.size.min
      : 0;
  $: max =
    $selectedLayer && isProportionalSymbolLayer($selectedLayer)
      ? $selectedLayer.style.size.max
      : 50;

  function onSizeChange(field: 'min' | 'max') {
    return function handleSizeChange(event: CustomEvent<{ value: number }>) {
      if ($selectedLayer && $map && isProportionalSymbolLayer($selectedLayer)) {
        dispatchLayerUpdate({
          type: 'size',
          map: $map,
          layer: $selectedLayer,
          payload: {
            [field]: event.detail.value
          }
        });
      }
    };
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="Min">Min</FieldLabel>
  <NumberInput
    min={1}
    max={Infinity}
    value={min}
    on:change={onSizeChange('min')}
  />
  <FieldLabel fieldId="Max">Max</FieldLabel>
  <NumberInput
    min={1}
    max={Infinity}
    value={max}
    on:change={onSizeChange('max')}
  />
</div>
