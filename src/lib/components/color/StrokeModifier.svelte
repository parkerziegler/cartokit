<script lang="ts">
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLayer;

  function onRemoveStroke() {
    dispatchLayerUpdate({
      type: 'remove-stroke',
      layer,
      payload: {}
    });
  }

  function onAddStroke() {
    dispatchLayerUpdate({
      type: 'add-stroke',
      layer,
      payload: {}
    });
  }
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
