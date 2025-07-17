<script lang="ts">
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import ProportionalSymbolIcon from '$lib/components/icons/ProportionalSymbolIcon.svelte';
  import ChoroplethLegend from '$lib/components/legends/ChoroplethLegend.svelte';
  import DotDensityLegend from '$lib/components/legends/DotDensityLegend.svelte';
  import HeatmapLegend from '$lib/components/legends/HeatmapLegend.svelte';
  import LineLegend from '$lib/components/legends/LineLegend.svelte';
  import PointLegend from '$lib/components/legends/PointLegend.svelte';
  import PolygonLegend from '$lib/components/legends/PolygonLegend.svelte';
  import ProportionalSymbolLegend from '$lib/components/legends/ProportionalSymbolLegend.svelte';
  import { map } from '$lib/stores/map';
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let layerVisible = $state(true);

  function toggleLayerVisibility() {
    if (layerVisible) {
      $map.setLayoutProperty(layer.id, 'visibility', 'none');

      if ($map.getLayer(`${layer.id}-stroke`)) {
        $map.setLayoutProperty(`${layer.id}-stroke`, 'visibility', 'none');
      }
    } else {
      $map.setLayoutProperty(layer.id, 'visibility', 'visible');

      if ($map.getLayer(`${layer.id}-stroke`)) {
        $map.setLayoutProperty(`${layer.id}-stroke`, 'visibility', 'visible');
      }
    }

    layerVisible = !layerVisible;
  }
</script>

<li class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <span class="shrink-0">
        {#if layer.type === 'Choropleth'}
          <ChoroplethIcon />
        {:else if layer.type === 'Dot Density'}
          <DotDensityIcon />
        {:else if layer.type === 'Heatmap'}
          <HeatmapIcon />
        {:else if layer.type === 'Line'}
          <LineIcon />
        {:else if layer.type === 'Point'}
          <PointIcon />
        {:else if layer.type === 'Polygon'}
          <PolygonIcon />
        {:else if layer.type === 'Proportional Symbol'}
          <ProportionalSymbolIcon />
        {/if}
      </span>
      <span
        class="mr-8 ml-2 truncate font-sans text-sm font-medium tracking-wider"
        >{layer.displayName}</span
      >
    </div>
    {#if layerVisible}
      <button onclick={toggleLayerVisibility}>
        <LayerVisibleIcon />
      </button>
    {:else}
      <button onclick={toggleLayerVisibility}>
        <LayerHiddenIcon />
      </button>
    {/if}
  </div>
  {#if layer.type === 'Choropleth'}
    <ChoroplethLegend {layer} />
  {:else if layer.type === 'Dot Density'}
    <DotDensityLegend {layer} />
  {:else if layer.type === 'Heatmap'}
    <HeatmapLegend {layer} />
  {:else if layer.type === 'Line'}
    <LineLegend {layer} />
  {:else if layer.type === 'Point'}
    <PointLegend {layer} />
  {:else if layer.type === 'Polygon'}
    <PolygonLegend {layer} />
  {:else if layer.type === 'Proportional Symbol'}
    <ProportionalSymbolLegend {layer} />
  {/if}
</li>
