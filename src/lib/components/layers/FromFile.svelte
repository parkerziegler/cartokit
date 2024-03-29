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

  let file: File;
  let displayName = '';

  function onFileUpload(fileInput: HTMLSpanElement, event: Event) {
    const { files } = event.target as HTMLInputElement;

    if (files?.length) {
      file = files[0];

      const name = files[0].name;
      fileInput.setAttribute('data-content', name);
    }
  }

  function onDisplayNameChange(event: CustomEvent<{ value: string }>) {
    displayName = event.detail.value;
  }

  function onSubmit() {
    const reader = new FileReader();

    reader.onload = function readGeoJSON(theFile) {
      if (typeof theFile.target?.result === 'string') {
        const featureCollection = normalizeGeoJSONToFeatureCollection(
          JSON.parse(theFile.target.result)
        );

        addSource($map, {
          kind: 'file',
          displayName,
          fileName: file.name,
          featureCollection
        });

        closeModal();
      }
    };

    reader.readAsText(file, 'UTF-8');
  }
</script>

<form class="stack stack-sm" on:submit={onSubmit}>
  <div class="stack stack-xs">
    <FieldLabel fieldId="File">File</FieldLabel>
    <FileInput id="File" onChange={onFileUpload} {file} />
  </div>
  <div class="stack stack-xs">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      on:change={onDisplayNameChange}
      value={displayName}
      placeholder="(e.g., National Parks)"
      id="Display Name"
    />
  </div>
  <Button class="self-end">Add</Button>
</form>
