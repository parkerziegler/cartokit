<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { ir } from '$lib/stores/ir';
  import type { BasemapProvider } from '$lib/types';
  import { BASEMAPS, TILE_URLS } from '$lib/utils/basemap';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';

  interface Props {
    provider: BasemapProvider;
  }

  let { provider }: Props = $props();
  let tileUrl = $state(
    $ir.basemap.provider === 'Custom' ? $ir.basemap.url : ''
  );

  const closeModal = getContext<() => void>('close-modal');

  function onTileUrlInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    tileUrl = event.currentTarget.value;
  }

  function onSelectBasemap(tileUrl: string) {
    return async function updateBasemap() {
      const diff: CartoKitDiff = {
        type: 'basemap',
        payload: {
          url: tileUrl,
          provider: provider
        }
      };

      await applyDiff(diff);

      closeModal();
    };
  }
</script>

{#if provider === 'Custom'}
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
      onclick={onSelectBasemap(tileUrl)}
      class="mt-2 self-end"
      disabled={!tileUrl || tileUrl === $ir.basemap.url}>Apply</Button
    >
  </form>
{:else}
  <div class="grid grid-cols-3 gap-4">
    {#each BASEMAPS[provider] as basemap (basemap.tileId)}
      <button
        class={[
          'flex flex-col rounded-sm border p-2 transition-colors hover:border-slate-400',
          TILE_URLS[provider](basemap.tileId) === $ir.basemap.url
            ? 'border-slate-400'
            : 'border-transparent'
        ]}
        onclick={onSelectBasemap(TILE_URLS[provider](basemap.tileId))}
      >
        <enhanced:img
          src={basemap.src}
          alt="tiles-{basemap.tileId}"
          class="rounded-xs"
        />
        <p class="mt-2 text-sm font-semibold">{basemap.title}</p>
      </button>
    {/each}
  </div>
{/if}
