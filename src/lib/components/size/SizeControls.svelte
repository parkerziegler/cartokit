<script lang="ts">
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();

  function onSizeChange(field: 'min' | 'max') {
    return function handleSizeChange(
      event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) {
      dispatchLayerUpdate({
        type: 'size',
        layerId: layer.id,
        payload: {
          [field]: +event.currentTarget.value
        }
      });
    };
  }
</script>

<div class="stack stack-2xs">
  <AttributeSelect
    layerId={layer.id}
    geojson={layer.data.geojson}
    visualizationType="Quantitative"
    selected={layer.style.size.attribute}
    channel="size"
  />
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="min">Min</FieldLabel>
    <NumberInput
      id="min"
      min={1}
      value={layer.style.size.min}
      onChange={onSizeChange('min')}
      class="w-10"
    />
  </div>
  <div class="stack-h stack-h-xs items-center">
    <FieldLabel fieldId="max">Max</FieldLabel>
    <NumberInput
      id="max"
      min={1}
      value={layer.style.size.max}
      onChange={onSizeChange('max')}
      class="w-10"
    />
  </div>
</div>
