<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import TooltipHiddenIcon from '$lib/components/icons/TooltipHiddenIcon.svelte';
  import TooltipIcon from '$lib/components/icons/TooltipIcon.svelte';
  import ProportionalSymbolIcon from '$lib/components/icons/ProportionalSymbolIcon.svelte';
  import ChoroplethLegend from '$lib/components/legends/ChoroplethLegend.svelte';
  import DotDensityLegend from '$lib/components/legends/DotDensityLegend.svelte';
  import HeatmapLegend from '$lib/components/legends/HeatmapLegend.svelte';
  import LineLegend from '$lib/components/legends/LineLegend.svelte';
  import PointLegend from '$lib/components/legends/PointLegend.svelte';
  import PolygonLegend from '$lib/components/legends/PolygonLegend.svelte';
  import ProportionalSymbolLegend from '$lib/components/legends/ProportionalSymbolLegend.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  function toggleLayerVisibility() {
    if (layer.layout.visibility === 'visible') {
      $map.setLayoutProperty(layer.id, 'visibility', 'none');

      if ($map.getLayer(`${layer.id}-stroke`)) {
        $map.setLayoutProperty(`${layer.id}-stroke`, 'visibility', 'none');
      }

      dispatchLayerUpdate({
        layerId: layer.id,
        type: 'layer-visibility',
        payload: {
          visibility: 'hidden'
        }
      });
    } else {
      $map.setLayoutProperty(layer.id, 'visibility', 'visible');

      if ($map.getLayer(`${layer.id}-stroke`)) {
        $map.setLayoutProperty(`${layer.id}-stroke`, 'visibility', 'visible');
      }

      dispatchLayerUpdate({
        layerId: layer.id,
        type: 'layer-visibility',
        payload: {
          visibility: 'visible'
        }
      });
    }
  }

  function toggleLayerTooltip() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'layer-tooltip-visibility',
      payload: {
        visible: !layer.layout.tooltip.visible
      }
    });
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
    <div class="flex items-center gap-2">
      <button
        onclick={toggleLayerVisibility}
        {@attach tooltip({
          content:
            layer.layout.visibility === 'visible' ? 'Hide Layer' : 'Show Layer'
        })}
      >
        {#if layer.layout.visibility === 'visible'}
          <LayerVisibleIcon />
        {:else}
          <LayerHiddenIcon />
        {/if}
      </button>
      <button
        {@attach tooltip({
          content: layer.layout.tooltip.visible
            ? 'Hide Layer Tooltip'
            : 'Show Layer Tooltip'
        })}
        onclick={toggleLayerTooltip}
      >
        {#if layer.layout.tooltip.visible}
          <TooltipIcon />
        {:else}
          <TooltipHiddenIcon />
        {/if}
      </button>
    </div>
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
