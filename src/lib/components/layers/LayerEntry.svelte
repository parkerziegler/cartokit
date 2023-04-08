<script lang="ts">
  import ChoroplethIcon from '$lib/components/layers/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/layers/icons/DotDensityIcon.svelte';
  import FillIcon from '$lib/components/layers/icons/FillIcon.svelte';
  import LayerHiddenIcon from '$lib/components/layers/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/layers/icons/LayerVisibleIcon.svelte';
  import ProportionalSymbolIcon from '$lib/components/layers/icons/ProportionalSymbolIcon.svelte';
  import ChoroplethLegend from '$lib/components/layers/legends/ChoroplethLegend.svelte';
  import { map } from '$lib/stores/map';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLayer;

  let layerVisible = true;

  function toggleLayerVisibility() {
    if (layerVisible) {
      $map?.setLayoutProperty(layer.id, 'visibility', 'none');
    } else {
      $map?.setLayoutProperty(layer.id, 'visibility', 'visible');
    }

    layerVisible = !layerVisible;
  }
</script>

<li class="stack stack-xs">
  <p class="stack-h stack-h-xs">
    {#if layer.type === 'Fill'}
      <FillIcon />
    {:else if layer.type === 'Choropleth'}
      <ChoroplethIcon />
    {:else if layer.type === 'Proportional Symbol'}
      <ProportionalSymbolIcon />
    {:else if layer.type === 'Dot Density'}
      <DotDensityIcon />
    {/if}
    <span class="ml-4 mr-8 text-sm">{layer.displayName}</span>
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
  {#if layer.type === 'Choropleth'}
    <ChoroplethLegend {layer} />
  {/if}
</li>
