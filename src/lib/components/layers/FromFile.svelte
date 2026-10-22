<script lang="ts">
  import { snakeCase, uniqueId } from 'lodash-es';
  import { getContext } from 'svelte';

  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff } from '$lib/core/diff';
  import type { CartoKitSource } from '$lib/types';
  import { extname } from '$lib/utils/file';

  const closeModal = getContext<() => void>('close-modal');

  let file: File | null = $state(null);
  let displayName = $state('');
  let dataLoading = $state(false);
  let error = $state('');

  function onFileUpload(f: File) {
    file = f;
  }

  function onDisplayNameInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    displayName = event.currentTarget.value;
  }

  async function onSubmit(
    event: Event & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault();

    if (!file || !displayName) {
      return;
    }

    dataLoading = true;
    error = '';

    try {
      const layerId = uniqueId(`${snakeCase(displayName)}__`);
      const ext = extname(file.name);
      let type: CartoKitSource['type'];

      switch (ext) {
        case '.geojson':
        case '.json':
          type = 'geojson';
          break;
        case '.geoparquet':
        case '.parquet':
          type = 'geoparquet';
          break;
        default:
          throw new Error(
            "Invalid file extension, expected one of: '.geojson', 'geoparquet', '.json', '.parquet'"
          );
      }

      await applyDiff({
        type: 'add-layer',
        layerId,
        payload: {
          type,
          location: {
            type: 'file',
            file
          },
          displayName
        }
      });

      displayName = '';
      file = null;
      closeModal();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Failed to read file. Please check the file and try again.';
    } finally {
      dataLoading = false;
    }
  }
</script>

<form class="flex w-lg flex-col gap-4" onsubmit={onSubmit}>
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
    disabled={!file || !displayName}>Add</Button
  >
</form>
