<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { history } from '$lib/state/history.svelte';
  import type { CartoKitLayer, LayerType } from '$lib/types';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
  import { geometryToLayerTypes } from '$lib/utils/layer';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();
  let transitioningLayerType = $state(false);

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
    const timeoutId = setTimeout(() => {
      transitioningLayerType = true;
    }, 1000);

    const update = {
      type: 'layer-type' as const,
      layerId: layer.id,
      payload: { layerType: event.currentTarget.value as LayerType }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'layer-type',
        layerId: layer.id,
        payload: {
          layerType: layer.type
        }
      }
    });

    dispatchLayerUpdate(update);

    $map.once('idle', () => {
      clearTimeout(timeoutId);
      transitioningLayerType = false;
    });
  }
</script>

<Select
  {options}
  selected={layer.type}
  id="layer-type-select"
  onchange={onLayerTypeChange}
  loading={transitioningLayerType}
/>
