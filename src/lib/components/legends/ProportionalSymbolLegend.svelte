<script lang="ts">
  import * as d3 from 'd3';

  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import { catalog } from '$lib/state/catalog.svelte';
  import type {
    CartoKitProportionalSymbolLayer,
    NumericCatalogEntry
  } from '$lib/types';
  import { hexWithOpacity } from '$lib/utils/color';
  import { signedSqrt, signedSquare } from '$lib/utils/number';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();

  let { min, max } = $derived(
    catalog.value[layer.id][layer.style.size.attribute] as NumericCatalogEntry
  );
  let domain = $derived([layer.style.size.min, layer.style.size.max]);
  let range = $derived([signedSqrt(min), signedSqrt(max)]);
  let scale = $derived(d3.scaleLinear(domain, range));
  let extent = $derived(domain[1] - domain[0]);

  let circles = $derived([
    {
      size: extent / 3 + min,
      value: signedSquare(scale(extent / 3 + min))
    },
    {
      size: (extent * 2) / 3 + min,
      value: signedSquare(scale((extent * 2) / 3 + min))
    },
    {
      size: extent + min,
      value: signedSquare(scale(extent + min))
    }
  ]);

  let style = $derived(
    layer.style.fill.type === 'Constant'
      ? `background-color: ${hexWithOpacity(layer.style.fill.color, layer.style.fill.opacity)};
      border-color: ${layer.style.stroke.visible ? hexWithOpacity(layer.style.stroke.color, layer.style.stroke.opacity) : 'transparent'};
      border-width: ${layer.style.stroke.visible ? layer.style.stroke.width : 0}px;`
      : ''
  );
</script>

<div
  class={[
    'ml-8 flex flex-col gap-2',
    layer.layout.visible ? 'opacity-100' : 'opacity-75'
  ]}
>
  <span class="text-xs font-semibold">{layer.style.size.attribute} ↓</span>
  <div class="grid grid-cols-[max-content_1fr] gap-2">
    {#each circles as circle (circle.value)}
      <div
        class="bg-primary justify-self-center rounded-full border border-white"
        style="width: {2 * circle.size}px; height: {2 * circle.size}px;{style}"
      ></div>
      <span class="text-3xs self-center">{circle.value.toFixed(2)}</span>
    {/each}
  </div>
  {#if layer.style.fill.visible && layer.style.fill.type === 'Categorical'}
    <CategoricalLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerType="Proportional Symbol"
      visible={layer.layout.visible}
    />
  {:else if layer.style.fill.visible && layer.style.fill.type === 'Quantitative'}
    <QuantitativeLegend
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      layerId={layer.id}
      layerType="Proportional Symbol"
      visible={layer.layout.visible}
    />
  {/if}
</div>
