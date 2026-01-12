<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
  import { geometryToLayerTypes } from '$lib/utils/layer';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let geometryType = $derived(
    getFeatureCollectionGeometryType(layer.data.sourceGeojson)
  );
  let options = $derived(
    geometryToLayerTypes.get(geometryType)?.map((layerType) => ({
      value: layerType,
      label: layerType
    })) ?? []
  );

  async function onLayerTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'layer-type',
      layerId: layer.id,
      payload: {
        sourceLayerType: layer.type,
        targetLayerType: event.currentTarget.value as LayerType
      }
    };

    await applyDiff(diff);
  }
</script>

<Select
  {options}
  selected={layer.type}
  id="layer-type-select"
  onchange={onLayerTypeChange}
/>
