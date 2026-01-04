<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { normalizeGeoJSONToFeatureCollection } from '$lib/utils/geojson';

  const closeModal = getContext<() => void>('close-modal');

  let file: File | null = $state(null);
  let displayName = $state('');
  let dataLoading = $state(false);

  function onFileUpload(f: File) {
    file = f;
  }

  function onDisplayNameInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    displayName = event.currentTarget.value;
  }

  function onSourceLoaded() {
    dataLoading = false;
    file = null;
    displayName = '';

    closeModal();
  }

  function onSubmit(
    event: Event & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault();

    if (!file || !displayName) {
      return;
    }

    dataLoading = true;
    const reader = new FileReader();

    reader.onload = async function readGeoJSON(theFile) {
      if (typeof theFile.target?.result === 'string' && file) {
        const featureCollection = normalizeGeoJSONToFeatureCollection(
          JSON.parse(theFile.target.result)
        );

        const layerId = uniqueId(`${kebabCase(displayName)}__`);

        await applyDiff({
          type: 'add-layer',
          layerId,
          payload: {
            type: 'file',
            displayName,
            fileName: file.name,
            featureCollection
          }
        });

        onSourceLoaded();
      }
    };

    reader.readAsText(file, 'UTF-8');
  }
</script>

<form class="flex flex-col gap-4" onsubmit={onSubmit}>
  <div class="flex flex-col gap-2">
    <FieldLabel fieldId="from-file-input">File</FieldLabel>
    <FileInput id="from-file-input" onfilechange={onFileUpload} {file} />
  </div>
  <div class="flex flex-col gap-2">
    <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
    <TextInput
      oninput={onDisplayNameInput}
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
