<script lang="ts">
  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-xs ml-8">
  {#if layer.style.fill?.type === 'Categorical'}
    <CategoricalLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerType="Choropleth"
    />
  {:else if layer.style.fill?.type === 'Quantitative'}
    <QuantitativeLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      features={layer.data.geojson.features}
      layerType="Choropleth"
    />
  {/if}
</div>
