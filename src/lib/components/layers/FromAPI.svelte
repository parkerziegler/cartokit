<script lang="ts">
  import * as turf from '@turf/turf';
  import kebabCase from 'lodash.kebabcase';
  import uniqueId from 'lodash.uniqueid';
  import { getContext } from 'svelte';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import { addSource } from '$lib/interaction/source';
  import { layers } from '$lib/stores/layers';
  import { map } from '$lib/stores/map';
  import type { CartoKitFillLayer } from '$lib/types/CartoKitLayer';
  import { randomColor } from '$lib/utils/color';
  import type { MapSourceDataEvent } from 'maplibre-gl';

  const closeModal = getContext<() => void>('close-modal');

  let endpoint = '';
  let displayName = '';
  let dataLoading = false;

  function onEndpointChange(event: CustomEvent<{ value: string }>) {
    endpoint = event.detail.value;
  }

  function onDisplayNameChange(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
  }

  function onDataLoaded(layer: CartoKitFillLayer) {
    return function handleDataLoaded(event: MapSourceDataEvent) {
      if (event.sourceId === layer.id) {
        dataLoading = false;
        closeModal();
        $map.off('sourcedata', onDataLoaded);
      }
    };
  }

  function onSubmit() {
    dataLoading = true;

    const layer: CartoKitFillLayer = {
      id: uniqueId(kebabCase(displayName)),
      displayName,
      type: 'Fill',
      data: {
        url: endpoint,
        geoJSON: turf.featureCollection([]),
        rawGeoJSON: turf.featureCollection([])
      },
      style: {
        fill: randomColor(),
        opacity: 1
      }
    };

    layers.update((lyrs) => {
      lyrs[layer.id] = layer;
      addSource($map, layer);

      return lyrs;
    });

    $map.on('sourcedata', onDataLoaded(layer));
  }
</script>

<form class="stack stack-sm" on:submit={onSubmit}>
  <div class="stack stack-xs">
    <FieldLabel fieldId="Endpoint">Endpoint</FieldLabel>
    <TextInput
      on:change={onEndpointChange}
      value={endpoint}
      placeholder="(e.g., https://www.nps.gov/lib/npmap.js/4.0.0/examples/data/national-parks.geojson)"
      id="Endpoint"
      class="w-full"
    />
  </div>
  <div class="stack stack-xs">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      on:change={onDisplayNameChange}
      value={displayName}
      placeholder="(e.g., National Parks)"
      id="Display Name"
      class="w-full"
    />
  </div>
  <Button class="self-end">
    {#if dataLoading}
      <span class="loader" />
    {:else}
      Add
    {/if}
  </Button>
</form>

<style>
  .loader {
    @apply relative inline-block h-4 w-4;
  }
  .loader::after,
  .loader::before {
    @apply absolute left-0 top-0 h-4 w-4 rounded-full bg-white;
    content: '';
    animation: animloader 0.5s ease-in-out infinite;
  }

  @keyframes animloader {
    0% {
      transform: scale(0);
      opacity: 1;
    }

    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
