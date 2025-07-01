<script lang="ts">
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();

  function onSizeChange(field: 'min' | 'max') {
    return function handleSizeChange(value: number) {
      const update = {
        type: 'size' as const,
        layerId: layer.id,
        payload: {
          [field]: value
        }
      };

      history.undo.push({
        execute: update,
        invert: {
          type: 'size',
          layerId: layer.id,
          payload: {
            [field]: layer.style.size[field]
          }
        }
      });

      dispatchLayerUpdate(update);
    };
  }
</script>

<div class="flex flex-col gap-1">
  <AttributeSelect
    layerId={layer.id}
    geojson={layer.data.geojson}
    visualizationType="Quantitative"
    selected={layer.style.size.attribute}
    channel="size"
  />
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="min">Min</FieldLabel>
    <NumberInput
      id="min"
      min={1}
      value={layer.style.size.min}
      onchange={onSizeChange('min')}
      class="w-10"
    />
  </div>
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="max">Max</FieldLabel>
    <NumberInput
      id="max"
      min={1}
      value={layer.style.size.max}
      onchange={onSizeChange('max')}
      class="w-10"
    />
  </div>
</div>
