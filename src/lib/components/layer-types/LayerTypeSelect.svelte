<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { error } from '$lib/state/error.svelte';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
  import {
    GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES,
    VECTOR_TILE_GEOMETRY_TYPES_TO_LAYER_TYPES
  } from '$lib/utils/layer';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let options = $derived.by(() => {
    switch (layer.source.type) {
      case 'geojson': {
        const geometryType = getFeatureCollectionGeometryType(
          layer.source.data
        );

        return (
          GEOJSON_GEOMETRY_TYPES_TO_LAYER_TYPES.get(geometryType)?.map(
            (layerType) => ({
              value: layerType,
              label: layerType
            })
          ) ?? []
        );
      }
      case 'vector': {
        const geometryType =
          layer.source.tilestats.layers[layer.source.sourceLayerIndex].geometry;

        return (
          VECTOR_TILE_GEOMETRY_TYPES_TO_LAYER_TYPES.get(geometryType)?.map(
            (layerType) => ({
              value: layerType,
              label: layerType
            })
          ) ?? []
        );
      }
    }
  });

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
