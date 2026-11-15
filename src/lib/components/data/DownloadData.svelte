<script lang="ts">
  import { snakeCase } from 'lodash-es';
  import { onMount } from 'svelte';

  import { tooltip } from '#lib/attachments/tooltip.ts';
  import DownloadIcon from '#lib/components/icons/DownloadIcon.svelte';
  import { db } from '#lib/state/db.svelte.ts';
  import type { CartoKitLayer } from '#lib/types/index.ts';
  import { downloadBlob } from '#lib/utils/download.ts';
  import { copyTableToGeoJSON } from '#lib/utils/geojson.ts';
  import { copyTableToGeoParquet } from '#lib/utils/geoparquet.ts';
  import { registerKeybinding } from '#lib/utils/keybinding.ts';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  async function onClick() {
    if (db.value && layer.source.type !== 'pmtiles') {
      let blob: Blob;
      let ext: string;

      switch (layer.source.type) {
        case 'geojson':
        case 'table':
          blob = await copyTableToGeoJSON({
            db: db.value.db,
            conn: db.value.conn,
            layerId: layer.id,
            displayName: layer.displayName,
            table: layer.source.table
          });
          ext = '.json';
          break;
        case 'geoparquet':
          blob = await copyTableToGeoParquet({
            db: db.value.db,
            conn: db.value.conn,
            layerId: layer.id,
            displayName: layer.displayName
          });
          ext = '.parquet';
      }

      downloadBlob(blob, `${snakeCase(layer.displayName)}${ext}`);
    }
  }

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('d', onClick);

    return deregisterKeybinding;
  });
</script>

<button
  onclick={onClick}
  {@attach tooltip({
    content: 'Download Data',
    keybinding: 'D',
    placement: 'bottom'
  })}
>
  <DownloadIcon />
</button>
