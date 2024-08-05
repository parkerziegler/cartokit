<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
  import { geometryToLayerTypes } from '$lib/utils/layer';

  export let layer: CartoKitLayer;

  $: geometryType = getFeatureCollectionGeometryType(layer.data.sourceGeojson);
  $: options =
    geometryToLayerTypes.get(geometryType)?.map((layerType) => ({
      value: layerType,
      label: layerType
    })) ?? [];

  function onChange(event: CustomEvent<{ value: LayerType }>) {
    dispatchLayerUpdate({
      type: 'layer-type',
      layerId: layer.id,
      payload: { layerType: event.detail.value }
    });
  }
</script>

<Select
  {options}
  selected={layer.type}
  id="layer-type-select"
  on:change={onChange}
/>
