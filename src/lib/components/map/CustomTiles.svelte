<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { ir } from '$lib/stores/ir';

  let tileUrl = $state(
    $ir.basemap.provider === 'Custom' ? $ir.basemap.url : ''
  );

  const closeModal = getContext<() => void>('close-modal');

  function onTileUrlInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    tileUrl = event.currentTarget.value;
  }

  async function onSubmit() {
    const diff: CartoKitDiff = {
      type: 'basemap',
      payload: {
        url: tileUrl,
        provider: 'Custom'
      }
    };

    await applyDiff(diff);

    closeModal();
  }
</script>

<form class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <FieldLabel fieldId="tile-url">Tile URL</FieldLabel>
    <TextInput
      oninput={onTileUrlInput}
      value={tileUrl}
      placeholder="(e.g., https://www.openhistoricalmap.org/map-styles/woodblock/woodblock.json)"
      id="tile-url"
      class="w-full"
    />
  </div>
  <Button
    onclick={onSubmit}
    class="mt-2 self-end"
    disabled={!tileUrl || tileUrl === $ir.basemap.url}>Apply</Button
  >
</form>
