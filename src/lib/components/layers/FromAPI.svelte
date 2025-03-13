<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { addSource } from '$lib/interaction/source';
  import { map } from '$lib/stores/map';

  const closeModal = getContext<() => void>('close-modal');

  let endpoint = '';
  let displayName = '';
  let dataLoading = false;

  function onEndpointInput(event: CustomEvent<{ value: string }>) {
    endpoint = event.detail.value;
  }

  function onDisplayNameInput(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
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
    performance.mark('reconciliation-start');

    dataLoading = true;

    addSource($map, {
      kind: 'api',
      displayName,
      url: endpoint,
      onSourceLoaded
    });
    performance.mark('reconciliation-end');

    const { duration } = performance.measure(
      'reconciliation',
      'reconciliation-start',
      'reconciliation-end'
    );
    console.log('recon', duration, window.programId);
  }
</script>

<form class="stack stack-sm" on:submit={onSubmit}>
  <div class="stack stack-xs">
    <FieldLabel fieldId="from-endpoint-input">Endpoint</FieldLabel>
    <TextInput
      on:input={onEndpointInput}
      value={endpoint}
      id="from-endpoint-input"
      class="w-full"
      placeholder="(e.g., https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson)"
    />
  </div>
  <div class="stack stack-xs">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      on:input={onDisplayNameInput}
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
