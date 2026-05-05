<script lang="ts">
  import { getContext } from 'svelte';
  import { uniqueId, kebabCase } from 'lodash-es';

  import Alert from '$lib/components/shared/Alert.svelte';
  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { normalizeGeoJSONToFeatureCollection } from '$lib/utils/geojson';
  import { VALID_GEOJSON_TYPES } from '$lib/utils/layer';

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
        try {
          const parsed = JSON.parse(theFile.target.result);

          if (!parsed.type) {
            throw new Error(
              'Missing required member "type" in GeoJSON file. Fix the file and try again.'
            );
          } else if (!VALID_GEOJSON_TYPES.has(parsed.type)) {
            throw new Error(
              `Invalid value for "type" in GeoJSON file: ${parsed.type}. Valid values are: ${Array.from(VALID_GEOJSON_TYPES).join(', ')}. Fix the file and try again.`
            );
          }

          const featureCollection = normalizeGeoJSONToFeatureCollection(parsed);
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

          displayName = '';
          file = null;
          closeModal();
        } catch (e) {
          error =
            e instanceof Error
              ? e.message
              : 'Invalid GeoJSON file. Please check the file and try again.';
        } finally {
          dataLoading = false;
        }
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
