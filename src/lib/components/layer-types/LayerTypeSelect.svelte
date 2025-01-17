<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
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

  function onLayerTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    dispatchLayerUpdate({
      type: 'layer-type',
      layerId: layer.id,
      payload: { layerType: event.currentTarget.value as LayerType }
    });
  }
</script>

<Select
  {options}
  selected={layer.type}
  id="layer-type-select"
  onchange={onLayerTypeChange}
/>
