<script lang="ts">
  import * as d3 from 'd3';

  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import { deriveExtent } from '$lib/interaction/scales';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';
  import { hexWithOpacity } from '$lib/utils/color';

  export let layer: CartoKitProportionalSymbolLayer;

  $: sizeMin = layer.style.size.min;
  $: sizeMax = layer.style.size.max;
  $: [min, max] = deriveExtent(
    layer.style.size.attribute,
    layer.data.geojson.features
  );

  $: scale = d3.scaleLinear([sizeMin, sizeMax], [min, max]);
  $: circles = [
    {
      size: sizeMax / 3,
      value: scale(sizeMax / 3)
    },
    {
      size: (sizeMax * 2) / 3,
      value: scale((sizeMax * 2) / 3)
    },
    {
      size: sizeMax,
      value: scale(sizeMax)
    }
  ];
  $: style =
    layer.style.fill?.type === 'Constant'
      ? `background-color: ${hexWithOpacity(layer.style.fill.color, layer.style.fill.opacity)}; border-color: ${layer.style.stroke ? hexWithOpacity(layer.style.stroke.color, layer.style.stroke.opacity) : 'transparent'}; border-width: ${layer.style.stroke?.width ?? 0}px;`
      : '';
</script>

<div class="stack stack-xs ml-8">
  <span class="text-xs font-semibold">{layer.style.size.attribute} →</span>
  <div class="stack-h stack-h-xs">
    {#each circles as circle}
      <div class="stack stack-xs items-center">
        <span class="text-3xs">{circle.value.toFixed(2)}</span>
        <div
          class="bg-primary rounded-full border border-white"
          style="width: {2 * circle.size}px; height: {2 *
            circle.size}px;{style}"
        ></div>
      </div>
    {/each}
  </div>
  {#if layer.style.fill?.type === 'Categorical'}
    <CategoricalLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerType="Proportional Symbol"
    />
  {:else if layer.style.fill?.type === 'Quantitative'}
    <QuantitativeLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      features={layer.data.geojson.features}
      layerType="Proportional Symbol"
    />
  {/if}
</div>
