<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitProportionalSymbolLayer;
  $: min = layer.style.size.min;
  $: max = layer.style.size.max;

  function onSizeChange(field: 'min' | 'max') {
    return function handleSizeChange(event: CustomEvent<{ value: number }>) {
      dispatchLayerUpdate({
        type: 'size',
        layer,
        payload: {
          [field]: event.detail.value
        }
      });
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
