<script lang="ts">
  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import type { CartoKitPointLayer } from '$lib/types';
  import { pluralize } from '$lib/utils/format';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitPointLayer;

  $: geometryType = getFeatureCollectionGeometryType(layer.data.geojson);
  $: dimension = layer.style.size * 2 + (layer.style.stroke?.width ?? 0) * 2;

  $: attrs =
    layer.style.fill?.type === 'Constant'
      ? {
          fill: layer.style.fill.color,
          'fill-opacity': layer.style.fill.opacity ?? 0,
          stroke: layer.style.stroke?.color ?? '#ffffff',
          'stroke-width': layer.style.stroke?.width ?? 0,
          'stroke-opacity': layer.style.stroke?.opacity ?? 0
        }
      : {
          fill: 'none',
          'fill-opacity': 0,
          stroke: '#ffffff',
          'stroke-width': 1,
          'stroke-opacity': 1
        };
</script>

<div class="stack stack-xs ml-8">
  <div class="stack-h stack-h-xs items-center">
    <svg
      viewBox="0 0 {dimension} {dimension}"
      width={dimension}
      height={dimension}
    >
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={layer.style.size - layer.style.size / 8}
        {...attrs}
      />
    </svg>
    <span
      >{layer.data.geojson.features.length}
      {pluralize(geometryType, layer.data.geojson.features.length)}</span
    >
  </div>
  {#if layer.style.fill?.type === 'Categorical'}
    <CategoricalLegend
      layerType="Point"
      fill={layer.style.fill}
      stroke={layer.style.stroke}
    />
  {:else if layer.style.fill?.type === 'Quantitative'}
    <QuantitativeLegend
      layerType="Point"
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      features={layer.data.geojson.features}
    />
  {/if}
</div>
