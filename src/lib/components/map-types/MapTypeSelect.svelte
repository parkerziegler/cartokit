<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import { GEOMETRY_TO_MAP_TYPES, type MapType } from '$lib/types/map-types';
  import { getLayerGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitLayer;
  $: geometryType = getLayerGeometryType(layer.data.rawGeoJSON);
  $: options = GEOMETRY_TO_MAP_TYPES[geometryType].map((mapType) => ({
    value: mapType,
    label: mapType
  }));

  const onChange = (event: CustomEvent<{ value: MapType }>) => {
    dispatchLayerUpdate({
      type: 'map-type',
      layer,
      payload: { mapType: event.detail.value }
    });
  };
</script>

<Select {options} selected={layer.type} on:change={onChange} />
