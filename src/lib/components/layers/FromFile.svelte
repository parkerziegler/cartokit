<script lang="ts">
  import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm/blocking';
  import snakeCase from 'lodash.snakecase';
  import uniqueId from 'lodash.uniqueid';
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { addSource } from '$lib/interaction/source';
  import { db } from '$lib/stores/db';
  import { map } from '$lib/stores/map';

  const closeModal = getContext<() => void>('close-modal');

  let file: File;
  let displayName = '';
  let dataLoading = false;

  const onFileUpload = (fileInput: HTMLSpanElement, event: Event) => {
    const { files } = event.target as HTMLInputElement;

    if (files?.length) {
      file = files[0];

      const name = files[0].name;
      fileInput.setAttribute('data-content', name);
    }
  };

  const onDisplayNameChange = (event: CustomEvent<{ value: string }>) => {
    displayName = event.detail.value;
  };

  const onSubmit = async () => {
    dataLoading = true;
    const layerId = uniqueId(`${snakeCase(displayName)}__`);

    const conn = await $db.connect();
    await $db.registerFileHandle(
      file.name,
      file,
      DuckDBDataProtocol.BROWSER_FSACCESS,
      true
    );
    await conn.query(
      `INSTALL spatial;
    LOAD spatial;
    CREATE TABLE ${layerId} AS SELECT * FROM ST_Read('${file.name}');`
    );

    const results = await conn.query(
      `SELECT * EXCLUDE geom, ST_AsGeoJSON(geom) AS geom FROM ${layerId};`
    );

    const features = results
      .toArray()
      .map(
        (row: { toJSON: () => { geom: string; [key: string]: unknown } }) => {
          const { geom, ...properties } = row.toJSON();

          return {
            type: 'Feature',
            properties,
            geometry: JSON.parse(geom)
          };
        }
      );

    addSource($map, {
      kind: 'file',
      id: layerId,
      displayName,
      fileName: file.name,
      featureCollection: {
        type: 'FeatureCollection',
        features
      }
    });

    dataLoading = false;
    closeModal();
  };
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
  <Button class="self-end" loading={dataLoading}>Add</Button>
</form>
