<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import { error } from '$lib/state/error.svelte';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import {
    GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES,
    GEOPARQUET_GEOMETRY_TYPES_TO_LAYER_TYPES,
    PMTILES_GEOMETRY_TYPES_TO_LAYER_TYPES
  } from '$lib/utils/layer';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let options = $derived(
    (getLayerTypes(layer) ?? []).map((layerType) => ({
      value: layerType,
      label: layerType
    }))
  );

  function getLayerTypes(layer: CartoKitLayer) {
    const entry = catalog.value[layer.id];

    switch (entry.type) {
      case 'geojson': {
        return GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES.get(entry.geometryType);
      }
      case 'geoparquet': {
        return GEOPARQUET_GEOMETRY_TYPES_TO_LAYER_TYPES.get(entry.geometryType);
      }
      case 'pmtiles': {
        return PMTILES_GEOMETRY_TYPES_TO_LAYER_TYPES.get(entry.geometryType);
      }
    }
  }

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

    try {
      await applyDiff(diff);
    } catch (e) {
      error.set(
        e instanceof Error ? e.message : 'Failed to change layer type.'
      );
    }
  }
</script>

<Select
  {options}
  selected={layer.type}
  id="layer-type-select"
  onchange={onLayerTypeChange}
/>
