<script lang="ts">
  import { kebabCase } from 'lodash-es';
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import DownloadIcon from '$lib/components/icons/DownloadIcon.svelte';
  import type { CartoKitLayer } from '$lib/types';
  import { downloadContentToFile } from '$lib/utils/files/download';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  function onClick() {
    downloadContentToFile(
      layer.data.geojson,
      `${kebabCase(layer.displayName)}.json`
    );
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
