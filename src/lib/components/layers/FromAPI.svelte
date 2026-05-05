<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';
  import type { MapSourceDataEvent } from 'maplibre-gl';

  import Alert from '$lib/components/shared/Alert.svelte';
  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { map } from '$lib/state/map.svelte';

  const closeModal = getContext<() => void>('close-modal');

  let endpoint = $state('');
  let displayName = $state('');
  let dataLoading = $state(false);
  let error = $state('');

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

  function handleSourceLoaded(layerId: string) {
    return (event: MapSourceDataEvent) => {
      if (event.sourceId === layerId) {
        dataLoading = false;
        error = '';
        endpoint = '';
        displayName = '';

        closeModal();
        map.value!.off('sourcedata', handleSourceLoaded(layerId));
      }
    };
  }

  async function onSubmit(
    event: Event & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault();

    if (!endpoint || !displayName) {
      return;
    }

    dataLoading = true;
    error = '';

    try {
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

      map.value!.on('sourcedata', handleSourceLoaded(layerId));

      endpoint = '';
      displayName = '';
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Failed to add layer. Check the endpoint and try again.';
    } finally {
      dataLoading = false;
    }
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
  {#if error}
    <Alert kind="error" message={error}>
      {#snippet icon()}
        <AlertIcon />
      {/snippet}
    </Alert>
  {/if}
  <Button
    class="self-end"
    loading={dataLoading}
    disabled={!endpoint || !displayName}>Add</Button
  >
</form>
