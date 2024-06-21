<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { ir } from '$lib/stores/ir';
  import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

  let tileUrl = $ir.basemap.provider === 'Custom' ? $ir.basemap.url : '';

  const closeModal = getContext<() => void>('close-modal');

  function onTileUrlInput(event: CustomEvent<{ value: string }>) {
    tileUrl = event.detail.value;
  }

  function onSubmit() {
    switchBasemapWithPreservedLayers(tileUrl, 'Custom');
    closeModal();
  }
</script>

<form class="stack stack-sm">
  <div class="stack stack-xs">
    <FieldLabel fieldId="tile-url">Tile URL</FieldLabel>
    <TextInput
      on:input={onTileUrlInput}
      value={tileUrl}
      placeholder="(e.g., https://www.openhistoricalmap.org/map-styles/woodblock/woodblock.json)"
      id="tile-url"
      class="w-full"
    />
  </div>
  <Button
    class="mt-2 self-end"
    on:click={onSubmit}
    disabled={!tileUrl || tileUrl === $ir.basemap.url}>Apply</Button
  >
</form>
