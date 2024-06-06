<script lang="ts">
  import kebabCase from 'lodash.kebabcase';

  import DownloadIcon from '$lib/components/icons/DownloadIcon.svelte';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLayer;

  function onClick() {
    const blob = new Blob([JSON.stringify(layer.data.geoJSON, null, 2)], {
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

<button on:click={onClick}>
  <DownloadIcon />
</button>
