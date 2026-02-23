<script lang="ts">
  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  interface Props {
    layer: CartoKitChoroplethLayer;
  }

  let { layer }: Props = $props();
</script>

<div class="ml-8 flex flex-col gap-2">
  {#if layer.style.fill.visible && layer.style.fill.type === 'Categorical'}
    <CategoricalLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerType="Choropleth"
      visible={layer.layout.visible}
    />
  {:else if layer.style.fill.visible && layer.style.fill.type === 'DiscreteQuantitative'}
    <QuantitativeLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerId={layer.id}
      layerType="Choropleth"
      visible={layer.layout.visible}
    />
  {:else if layer.style.fill.visible && layer.style.fill.type === 'ContinuousQuantitative'}
    <!-- TODO: add ContinuousQuantitativeLegend component -->
  {/if}
</div>
