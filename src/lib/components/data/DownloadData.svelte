<script lang="ts">
  import { snakeCase } from 'lodash-es';
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import DownloadIcon from '$lib/components/icons/DownloadIcon.svelte';
  import { db } from '$lib/state/db.svelte';
  import type { CartoKitLayer } from '$lib/types';
  import { downloadBlob } from '$lib/utils/download';
  import { copyTableToGeoJSON } from '$lib/utils/geojson';
  import { copyTableToGeoParquet } from '$lib/utils/geoparquet';
  import { registerKeybinding } from '$lib/utils/keybinding';

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
          blob = await copyTableToGeoJSON(
            db.value.db,
            db.value.conn,
            layer.id,
            layer.displayName
          );
          ext = '.json';
          break;
        case 'geoparquet':
          blob = await copyTableToGeoParquet(
            db.value.db,
            db.value.conn,
            layer.id,
            layer.displayName
          );
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
