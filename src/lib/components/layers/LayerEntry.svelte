<script lang="ts">
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import ChoroplethLegend from '$lib/components/legends/ChoroplethLegend.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import DotDensityLegend from '$lib/components/legends/DotDensityLegend.svelte';
  import FillIcon from '$lib/components/icons/FillIcon.svelte';
  import FillLegend from '$lib/components/legends/FillLegend.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PointLegend from '$lib/components/legends/PointLegend.svelte';
  import ProportionalSymbolIcon from '$lib/components/icons/ProportionalSymbolIcon.svelte';
  import ProportionalSymbolLegend from '$lib/components/legends/ProportionalSymbolLegend.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import { map } from '$lib/stores/map';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLayer;

  let layerVisible = true;

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

<li class="stack stack-xs">
  <p class="flex items-center">
    <span class="shrink-0">
      {#if layer.type === 'Point'}
        <PointIcon />
      {:else if layer.type === 'Fill'}
        <FillIcon />
      {:else if layer.type === 'Choropleth'}
        <ChoroplethIcon />
      {:else if layer.type === 'Proportional Symbol'}
        <ProportionalSymbolIcon />
      {:else if layer.type === 'Dot Density'}
        <DotDensityIcon />
      {/if}
    </span>
    <span class="ml-2 mr-8 truncate text-sm">{layer.displayName}</span>
    {#if layerVisible}
      <button on:click={toggleLayerVisibility}>
        <LayerVisibleIcon />
      </button>
    {:else}
      <button on:click={toggleLayerVisibility}>
        <LayerHiddenIcon />
      </button>
    {/if}
  </p>
  {#if layer.type === 'Point'}
    <PointLegend {layer} />
  {:else if layer.type === 'Fill'}
    <FillLegend {layer} />
  {:else if layer.type === 'Choropleth'}
    <ChoroplethLegend {layer} />
  {:else if layer.type === 'Proportional Symbol'}
    <ProportionalSymbolLegend {layer} />
  {:else if layer.type === 'Dot Density'}
    <DotDensityLegend {layer} />
  {/if}
</li>
