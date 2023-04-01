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

  const closeModal = getContext<() => void>('close-modal');

  let endpoint = '';
  let displayName = '';

  function onEndpointChange(event: CustomEvent<{ value: string }>) {
    endpoint = event.detail.value;
  }

  function onDisplayNameChange(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
  }

  function onSubmit() {
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

      if ($map) {
        addSource($map, layer);
      }

      return lyrs;
    });

    closeModal();
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
  <Button class="self-end">Add</Button>
</form>
