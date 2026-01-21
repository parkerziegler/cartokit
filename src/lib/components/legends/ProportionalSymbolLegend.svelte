<script lang="ts">
  import * as d3 from 'd3';

  import CategoricalLegend from '$lib/components/legends/CategoricalLegend.svelte';
  import QuantitativeLegend from '$lib/components/legends/QuantitativeLegend.svelte';
  import { catalog } from '$lib/state/catalog.svelte';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';
  import { hexWithOpacity } from '$lib/utils/color';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();

  let { min, max } = $derived(
    catalog.value[layer.id][layer.style.size.attribute]
  );
  let scale = $derived(
    d3.scaleLinear([layer.style.size.min, layer.style.size.max], [min, max])
  );

  let circles = $derived([
    {
      size: layer.style.size.max / 3,
      value: scale(layer.style.size.max / 3)
    },
    {
      size: (layer.style.size.max * 2) / 3,
      value: scale((layer.style.size.max * 2) / 3)
    },
    {
      size: layer.style.size.max,
      value: scale(layer.style.size.max)
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
  <span class="text-xs font-semibold">{layer.style.size.attribute} →</span>
  <div class="flex gap-2">
    {#each circles as circle (circle.value)}
      <div class="flex flex-col items-center gap-2">
        <span class="text-3xs">{circle.value.toFixed(2)}</span>
        <div
          class="bg-primary rounded-full border border-white"
          style="width: {2 * circle.size}px; height: {2 *
            circle.size}px;{style}"
        ></div>
      </div>
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
