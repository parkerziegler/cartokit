<script lang="ts">
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { deriveExtent } from '$lib/interaction/scales';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
  import { clickOutside } from '$lib/utils/actions';

  export let layer: CartoKitChoroplethLayer;
  export let toggleBreaksEditorVisibility: () => void;

  $: count = layer.style.fill.count;
  $: colors = layer.style.fill.scheme[count];
  $: [min, max] = deriveExtent(
    layer.style.fill.attribute,
    layer.data.geoJSON.features
  );
  $: thresholds = layer.style.fill.thresholds;

  function onThresholdChange(i: number) {
    return function handleThresholdChange(
      event: CustomEvent<{ value: number }>
    ) {
      dispatchLayerUpdate({
        type: 'color-threshold',
        layer,
        payload: {
          index: i,
          threshold: event.detail.value
        }
      });
    };
  }
</script>

<Menu class="w-80 overflow-auto">
  <MenuItem title="Set steps">
    <button on:click={toggleBreaksEditorVisibility} slot="action">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
    <div
      class="breaks-grid grid gap-x-2 gap-y-1"
      use:clickOutside
      on:clickoutside={toggleBreaksEditorVisibility}
    >
      {#each [min, ...thresholds] as threshold, i}
        <span class="h-6 self-center" style="background-color: {colors[i]};" />
        <span class="self-center">{threshold.toFixed(2)}</span>
        <span class="self-center">to</span>
        <NumberInput
          value={thresholds[i] ?? max}
          step={0.01}
          class="self-center p-1"
          disabled={i === thresholds.length}
          on:change={onThresholdChange(i)}
        />
      {/each}
    </div>
  </MenuItem>
</Menu>

<style>
  .breaks-grid {
    grid-template-columns: 0.75rem 1fr 1rem 1fr;
  }
</style>
