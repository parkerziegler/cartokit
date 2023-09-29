<script lang="ts">
  import { getContext } from 'svelte';
  import type { MapSourceDataEvent } from 'maplibre-gl';
  import { featureCollection as turfFeatureCollection } from '@turf/helpers';
  import kebabCase from 'lodash.kebabcase';
  import uniqueId from 'lodash.uniqueid';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import { addSource } from '$lib/interaction/source';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';
  import type { CartoKitFillLayer } from '$lib/types/CartoKitLayer';
  import { randomColor } from '$lib/utils/color';
  import {
    DEFAULT_OPACITY,
    DEFAULT_STROKE_OPACITY,
    DEFAULT_STROKE_WIDTH
  } from '$lib/utils/constants';

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

    const color = randomColor();
    const layer: CartoKitFillLayer = {
      id: uniqueId(kebabCase(displayName)),
      displayName,
      type: 'Fill',
      data: {
        url: endpoint,
        geoJSON: turfFeatureCollection([]),
        rawGeoJSON: turfFeatureCollection([]),
        transformations: []
      },
      style: {
        fill: {
          color,
          opacity: DEFAULT_OPACITY
        },
        stroke: {
          color,
          width: DEFAULT_STROKE_WIDTH,
          opacity: DEFAULT_STROKE_OPACITY
        }
      }
    };

    ir.update((ir) => {
      ir.layers[layer.id] = layer;
      addSource($map, layer);

      return ir;
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
      <span class="loader align-text-top" />
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
