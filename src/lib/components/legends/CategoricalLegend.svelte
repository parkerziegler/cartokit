<script lang="ts">
  import * as d3 from 'd3';

  import type { CategoricalFill, ConstantStroke, LayerType } from '$lib/types';
  import { DEFAULT_FILL } from '$lib/utils/constants';
  import { materializeColorScheme } from '$lib/utils/scheme';

  interface Props {
    fill: CategoricalFill;
    stroke?: ConstantStroke;
    layerType: LayerType;
  }

  let { fill, stroke, layerType }: Props = $props();

  let entries = $derived(
    d3[fill.scheme.id].length < fill.categories.length
      ? fill.categories.slice(0, d3[fill.scheme.id].length).concat('Other')
      : fill.categories
  );
  let colors = $derived(
    materializeColorScheme(
      fill.scheme.id,
      fill.scheme.direction,
      entries.length
    )
  );
</script>

<div class="flex flex-col gap-2 text-white">
  <p class="font-semibold">{fill.attribute} ↓</p>
  <ul class="flex flex-col gap-1">
    {#each entries as category, i (category)}
      <li class="flex gap-2">
        {#if layerType === 'Choropleth'}
          <svg viewBox="0 0 32 16" width="32" height="16">
            <rect
              x="0"
              y="0"
              width="32"
              height="16"
              fill={colors[i] ?? DEFAULT_FILL}
              fill-opacity={fill.opacity}
              stroke={stroke?.color ?? 'none'}
              stroke-width={stroke?.width ?? '0'}
              stroke-opacity={stroke?.opacity ?? '0'}
            />
          </svg>
        {:else if layerType === 'Proportional Symbol' || layerType === 'Point'}
          <svg viewBox="0 0 16 16" width="16" height="16">
            <circle
              r="7"
              cx="8"
              cy="8"
              fill={colors[i] ?? DEFAULT_FILL}
              fill-opacity={fill.opacity}
              stroke={stroke?.color ?? 'none'}
              stroke-width={stroke?.width ?? '0'}
              stroke-opacity={stroke?.opacity ?? '0'}
            />
          </svg>
        {/if}
        <span class="text-3xs">{category}</span>
      </li>
    {/each}
  </ul>
</div>
