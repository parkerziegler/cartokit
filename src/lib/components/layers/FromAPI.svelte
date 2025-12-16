<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';
  import type { MapSourceDataEvent } from 'maplibre-gl';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { map } from '$lib/state/map.svelte';
  import { applyDiff } from '$lib/core/diff';

  const closeModal = getContext<() => void>('close-modal');

  let endpoint = $state('');
  let displayName = $state('');
  let dataLoading = $state(false);

  function onEndpointInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    endpoint = event.currentTarget.value;
  }

  function onDisplayNameInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    displayName = event.currentTarget.value;
  }

  function handleSourceLoaded(event: MapSourceDataEvent, layerId: string) {
    if (event.sourceId === layerId) {
      dataLoading = false;
      endpoint = '';
      displayName = '';

      closeModal();
    }
  }

  async function onSubmit(
    event: Event & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault();

    if (!endpoint || !displayName) {
      return;
    }

    dataLoading = true;

    const layerId = uniqueId(`${kebabCase(displayName)}__`);

    await applyDiff({
      type: 'add-layer',
      layerId,
      payload: {
        type: 'api',
        displayName,
        url: endpoint
      }
    });

    map.value!.on('sourcedata', (event: MapSourceDataEvent) =>
      handleSourceLoaded(event, layerId)
    );
  }
</script>

<form class="flex flex-col gap-4" onsubmit={onSubmit}>
  <div class="flex flex-col gap-2">
    <FieldLabel fieldId="from-endpoint-input">Endpoint</FieldLabel>
    <TextInput
      oninput={onEndpointInput}
      value={endpoint}
      id="from-endpoint-input"
      class="w-full"
      placeholder="(e.g., https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson)"
    />
  </div>
  <div class="flex flex-col gap-2">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      oninput={onDisplayNameInput}
      value={displayName}
      id="Display Name"
      class="w-full"
      placeholder="(e.g., Earthquakes)"
    />
  </div>
  <Button
    class="self-end"
    loading={dataLoading}
    disabled={!endpoint || !displayName}>Add</Button
  >
</form>
