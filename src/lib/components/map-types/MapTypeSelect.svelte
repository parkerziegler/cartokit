<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import { GEOMETRY_TO_MAP_TYPES, type MapType } from '$lib/types/map-types';
  import { getLayerGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitLayer;
  $: geometry = getLayerGeometryType(layer.data.rawGeoJSON);
  $: options = GEOMETRY_TO_MAP_TYPES[geometry].map((mapType) => ({
    value: mapType,
    label: mapType
  }));

  function onChange(event: CustomEvent<{ value: MapType }>) {
    dispatchLayerUpdate({
      type: 'map-type',
      layer,
      payload: { mapType: event.detail.value }
    });
  }
</script>

<Select {options} selected={layer.type} on:change={onChange} />
