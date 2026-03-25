<script lang="ts">
  import { kebabCase } from 'lodash-es';
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import DownloadIcon from '$lib/components/icons/DownloadIcon.svelte';
  import type { CartoKitLayer } from '$lib/types';
  import { registerKeybinding } from '$lib/utils/keybinding';

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
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
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
