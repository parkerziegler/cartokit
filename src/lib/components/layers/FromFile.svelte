<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { addSource } from '$lib/interaction/source';
  import { map } from '$lib/stores/map';
  import { normalizeGeoJSONToFeatureCollection } from '$lib/utils/geojson';

  const closeModal = getContext<() => void>('close-modal');

  let file: File | null = null;
  let displayName = '';
  let dataLoading = false;

  function onFileUpload(event: CustomEvent<{ file: File }>) {
    file = event.detail.file;
  }

  function onDisplayNameInput(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
  }

  function onSourceLoaded() {
    dataLoading = false;
    file = null;
    displayName = '';

    closeModal();
  }

  function onSubmit() {
    performance.mark('reconciliation-start');
    if (!file || !displayName) {
      return;
    }

    dataLoading = true;
    const reader = new FileReader();

    reader.onload = function readGeoJSON(theFile) {
      if (typeof theFile.target?.result === 'string' && file) {
        const featureCollection = normalizeGeoJSONToFeatureCollection(
          JSON.parse(theFile.target.result)
        );

        addSource($map, {
          kind: 'file',
          displayName,
          fileName: file.name,
          featureCollection,
          onSourceLoaded
        });

        closeModal();
      }
    };

    reader.readAsText(file, 'UTF-8');
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
    <FieldLabel fieldId="from-file-input">File</FieldLabel>
    <FileInput id="from-file-input" on:change={onFileUpload} {file} />
  </div>
  <div class="stack stack-xs">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      on:input={onDisplayNameInput}
      value={displayName}
      id="Display Name"
      placeholder="(e.g., Earthquakes)"
    />
  </div>
  <Button
    class="self-end"
    loading={dataLoading}
    disabled={!file || !displayName}>Add</Button
  >
</form>
