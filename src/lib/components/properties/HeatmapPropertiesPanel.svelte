<script lang="ts">
  import HeatmapOpacity from '$lib/components/channel/heatmap/HeatmapOpacity.svelte';
  import HeatmapRadius from '$lib/components/channel/heatmap/HeatmapRadius.svelte';
  import HeatmapWeight from '$lib/components/channel/heatmap/HeatmapWeight.svelte';
  import ColorRampSelect from '$lib/components/color/ColorRampSelect.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();
</script>

<MenuItem title="Weight">
  <HeatmapWeight {layer} />
</MenuItem>
<MenuItem title="Display">
  <ColorRampSelect
    layerId={layer.id}
    channel="heatmap-color"
    ramp={layer.style.heatmap.ramp}
  />
  <HeatmapRadius {layer} />
  <HeatmapOpacity {layer} />
</MenuItem>
