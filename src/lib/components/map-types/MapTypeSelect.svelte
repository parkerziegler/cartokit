<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { mapType } from '$lib/stores/map-type';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { MAP_TYPES, type MapType } from '$lib/types/map-types';

  const options = MAP_TYPES.map((mapType) => ({
    value: mapType,
    label: mapType
  }));

  function onChange(event: CustomEvent<{ value: MapType }>) {
    if ($selectedLayer) {
      dispatchLayerUpdate({
        type: 'map-type',
        layer: $selectedLayer,
        payload: { mapType: event.detail.value }
      });
    }
  }
</script>

<Select {options} selected={$mapType} on:change={onChange} />
