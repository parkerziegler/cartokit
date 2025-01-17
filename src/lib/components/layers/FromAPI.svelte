<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { addSource } from '$lib/interaction/source';
  import { map } from '$lib/stores/map';

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

  function onSourceLoaded() {
    dataLoading = false;
    endpoint = '';
    displayName = '';

    closeModal();
  }

  function onSubmit() {
    if (!endpoint || !displayName) {
      return;
    }

    dataLoading = true;

    addSource($map, {
      kind: 'api',
      displayName,
      url: endpoint,
      onSourceLoaded
    });
  }
</script>

<form class="stack stack-sm" onsubmit={onSubmit}>
  <div class="stack stack-xs">
    <FieldLabel fieldId="from-endpoint-input">Endpoint</FieldLabel>
    <TextInput
      oninput={onEndpointInput}
      value={endpoint}
      id="from-endpoint-input"
      class="w-full"
      placeholder="(e.g., https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson)"
    />
  </div>
  <div class="stack stack-xs">
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
