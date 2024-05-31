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

  function onEndpointChange(event: CustomEvent<{ value: string }>) {
    endpoint = event.detail.value;
  }

  function onDisplayNameChange(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
  }

  function onSourceLoaded() {
    dataLoading = false;
    closeModal();
  }

  function onSubmit() {
    dataLoading = true;

    addSource($map, {
      kind: 'api',
      displayName,
      url: endpoint,
      onSourceLoaded
    });
  }
</script>

<form class="stack stack-sm" on:submit={onSubmit}>
  <div class="stack stack-xs">
    <FieldLabel fieldId="from-endpoint-input">Endpoint</FieldLabel>
    <TextInput
      on:change={onEndpointChange}
      value={endpoint}
      placeholder="(e.g., https://www.nps.gov/lib/npmap.js/4.0.0/examples/data/national-parks.geojson)"
      id="from-endpoint-input"
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
  <Button class="self-end" loading={dataLoading}>Add</Button>
</form>
