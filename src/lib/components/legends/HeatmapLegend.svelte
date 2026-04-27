<script lang="ts">
  import ColorRamp from '$lib/components/channel/shared/ColorRamp.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();
</script>

<div
  class={[
    'ml-8 flex flex-col gap-2',
    layer.layout.visible ? 'opacity-100' : 'opacity-75'
  ]}
>
  {#if layer.style.heatmap.weight.type === 'Quantitative'}
    <span class="text-xs font-semibold"
      >{layer.style.heatmap.weight.attribute} →</span
    >
  {/if}
  <ColorRamp
    ramp={layer.style.heatmap.ramp.id}
    direction={layer.style.heatmap.ramp.direction}
  />
  <div class="text-3xs flex justify-between">
    <span>Low</span>
    <span>High</span>
  </div>
</div>
