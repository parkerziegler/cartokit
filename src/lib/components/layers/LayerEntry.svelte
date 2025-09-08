<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
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
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  function toggleLayerVisibility() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'layer-visibility',
      payload: {
        visibility: layer.layout.visibility === 'visible' ? 'hidden' : 'visible'
      }
    });
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

  function removeLayer() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'remove-layer',
      payload: {}
    });
  }
</script>

<li class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="flex items-center overflow-hidden">
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
        class="mx-2 min-w-[10rem] truncate font-sans text-sm font-medium tracking-wider"
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
      <button
        {@attach tooltip({
          content: 'Remove Layer'
        })}
        onclick={removeLayer}
      >
        <MinusIcon />
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
