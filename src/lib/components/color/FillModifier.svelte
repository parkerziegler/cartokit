<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitFillLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';

  export let layer:
    | CartoKitFillLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  function onRemoveFill() {
    dispatchLayerUpdate({
      type: 'remove-fill',
      layer,
      payload: {}
    });
  }

  function onAddFill() {
    dispatchLayerUpdate({
      type: 'add-fill',
      layer,
      payload: {}
    });
  }
</script>

{#if layer.style.fill}
  <button on:click={onRemoveFill}>
    <MinusIcon />
  </button>
{:else}
  <button on:click={onAddFill}>
    <PlusIcon />
  </button>
{/if}
