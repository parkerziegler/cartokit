<script lang="ts">
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg
    >
  </button>
{:else}
  <button on:click={onAddStroke}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><line x1="12" y1="5" x2="12" y2="19" /><line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
      /></svg
    >
  </button>
{/if}
