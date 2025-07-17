<script lang="ts">
  import HeatmapColor from '$lib/components/channel/heatmap/HeatmapColor.svelte';
  import HeatmapOpacity from '$lib/components/channel/heatmap/HeatmapOpacity.svelte';
  import HeatmapRadius from '$lib/components/channel/heatmap/HeatmapRadius.svelte';
  import HeatmapWeight from '$lib/components/channel/heatmap/HeatmapWeight.svelte';
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
  <HeatmapColor {layer} />
  <HeatmapRadius {layer} />
  <HeatmapOpacity {layer} />
</MenuItem>
