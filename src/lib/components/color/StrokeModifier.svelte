<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitPointLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer,
    CartoKitFillLayer,
    CartoKitChoroplethLayer
  } from '$lib/types/CartoKitLayer';

  export let layer:
    | CartoKitPointLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer
    | CartoKitFillLayer
    | CartoKitChoroplethLayer;

  const onRemoveStroke = (): void => {
    dispatchLayerUpdate({
      type: 'remove-stroke',
      layer,
      payload: {}
    });
  };

  const onAddStroke = (): void => {
    dispatchLayerUpdate({
      type: 'add-stroke',
      layer,
      payload: {}
    });
  };
</script>

{#if layer.style.stroke}
  <button on:click={onRemoveStroke}>
    <MinusIcon />
  </button>
{:else}
  <button on:click={onAddStroke}>
    <PlusIcon />
  </button>
{/if}
