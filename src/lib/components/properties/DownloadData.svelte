<script lang="ts">
  import { kebabCase } from 'lodash-es';
  import { onMount } from 'svelte';
  import { on } from 'svelte/events';

  import { tooltip } from '$lib/attachments/tooltip';
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

  onMount(() => {
    const off = on(document, 'keydown', (event) => {
      if (event.key === 'd') {
        onClick();
      }
    });

    return off;
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
