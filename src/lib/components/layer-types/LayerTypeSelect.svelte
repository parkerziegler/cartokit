<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import { error } from '$lib/state/error.svelte';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
  import {
    GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES,
    GEOPARQUET_GEOMETRY_TYPES_TO_LAYER_TYPES,
    VECTOR_GEOMETRY_TYPES_TO_LAYER_TYPES
  } from '$lib/utils/layer';
  import { selectTileStats } from '$lib/utils/pmtiles';

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
    switch (layer.source.type) {
      case 'geojson': {
        const geometryType = getFeatureCollectionGeometryType(
          layer.source.sourceData
        );

        return GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES.get(geometryType);
      }
      case 'geoparquet': {
        const entry = catalog.value[layer.id];

        return entry.type === 'geoparquet'
          ? GEOPARQUET_GEOMETRY_TYPES_TO_LAYER_TYPES.get(entry.geometryType)
          : undefined;
      }
      case 'vector': {
        const { geometry } = selectTileStats(layer.source);

        return VECTOR_GEOMETRY_TYPES_TO_LAYER_TYPES.get(geometry);
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
