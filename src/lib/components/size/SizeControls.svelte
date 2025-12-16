<script lang="ts">
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();

  async function onMinSizeChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'min-size',
      layerId: layer.id,
      payload: {
        minSize: value
      }
    };

    await applyDiff(diff);
  }

  async function onMaxSizeChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'max-size',
      layerId: layer.id,
      payload: {
        maxSize: value
      }
    };

    await applyDiff(diff);
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
      onchange={onMinSizeChange}
      class="w-10"
    />
  </div>
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="max">Max</FieldLabel>
    <NumberInput
      id="max"
      min={1}
      value={layer.style.size.max}
      onchange={onMaxSizeChange}
      class="w-10"
    />
  </div>
</div>
