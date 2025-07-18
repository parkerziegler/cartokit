<script lang="ts">
  import ColorSchemeRamp from '$lib/components/channel/shared/ColorRamp.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();
</script>

<div class="ml-8 flex max-w-48 flex-col gap-2">
  {#if layer.style.heatmap.weight.type === 'Quantitative'}
    <span class="text-xs font-semibold"
      >{layer.style.heatmap.weight.attribute} →</span
    >
  {/if}
  <ColorSchemeRamp
    ramp={layer.style.heatmap.ramp.id}
    direction={layer.style.heatmap.ramp.direction}
  />
  <div class="text-2xs flex justify-between">
    <span>Low</span>
    <span>High</span>
  </div>
</div>
