<script lang="ts">
  import { kebabCase } from 'lodash-es';

  import DownloadIcon from '$lib/components/icons/DownloadIcon.svelte';
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  function onClick() {
    const blob = new Blob([JSON.stringify(layer.data.geojson, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kebabCase(layer.displayName)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<button onclick={onClick}>
  <DownloadIcon />
</button>
