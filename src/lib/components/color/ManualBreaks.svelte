<script lang="ts">
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { deriveExtent } from '$lib/interaction/scales';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;

  $: count = layer.style.breaks.count;
  $: colors = layer.style.breaks.scheme[count] as string[];
  $: [min, max] = deriveExtent(layer.attribute, layer.data.geoJSON.features);
  $: thresholds = layer.style.breaks.thresholds;

  function onThresholdChange(i: number) {
    return function handleThresholdChange(
      event: CustomEvent<{ value: number }>
    ) {
      if ($map) {
        dispatchLayerUpdate({
          type: 'color-threshold',
          layer,
          map: $map,
          payload: {
            index: i,
            threshold: event.detail.value
          }
        });
      }
    };
  }
</script>

<Menu class="max-w-xs overflow-auto">
  <MenuItem title="Set Stops">
    <div class="breaks-grid grid gap-2">
      {#each [min, ...thresholds] as threshold, i}
        <span class="h-4 self-center" style="background-color: {colors[i]};" />
        <span class="self-center">{threshold.toFixed(2)}</span>
        <span class="self-center">to</span>
        <NumberInput
          value={thresholds[i] ?? max}
          step={0.01}
          class="self-center p-1"
          on:change={onThresholdChange(i)}
        />
      {/each}
    </div>
  </MenuItem>
</Menu>

<style>
  .breaks-grid {
    grid-template-columns: 1.5rem 1fr 1rem 1fr;
  }
</style>
