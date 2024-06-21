<script lang="ts">
  import cs from 'classnames';
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { switchBasemapWithPreservedLayers } from '$lib/utils/maplibre';

  let tileUrl = '';

  const closeModal = getContext<() => void>('close-modal');

  function onTileUrlInput(event: CustomEvent<{ value: string }>) {
    tileUrl = event.detail.value;
  }

  function onSubmit() {
    switchBasemapWithPreservedLayers(tileUrl, 'Custom');
    closeModal();
    tileUrl = '';
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
      placeholder=""
      id="tile-url"
      class="w-full"
    />
  </div>
  <Button class="mt-2 self-end" on:click={onSubmit}>Apply</Button>
</div>
