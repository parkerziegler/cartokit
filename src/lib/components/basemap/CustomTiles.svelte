<script lang="ts">
  import cs from 'classnames';
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

<div class="flex h-full flex-col">
  <div
    class={cs(
      'stack stack-xs basis-1/3 rounded-sm border border-transparent p-2 transition-colors'
    )}
  >
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
</div>
