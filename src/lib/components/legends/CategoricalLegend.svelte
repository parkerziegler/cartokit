<script lang="ts">
  import type { CategoricalFill, ConstantStroke, LayerType } from '$lib/types';
  import { DEFAULT_FILL } from '$lib/utils/constants';

  export let fill: CategoricalFill;
  export let stroke: ConstantStroke | undefined;
  export let layerType: LayerType;

  $: entries =
    fill.scheme.length < fill.categories.length
      ? fill.categories.slice(0, fill.scheme.length).concat('Other')
      : fill.categories;
</script>

<div class="stack stack-xs text-white">
  <p class="font-semibold">{fill.attribute} ↓</p>
  <ul class="stack stack-2xs">
    {#each entries as category, i}
      <li class="stack-h stack-h-xs">
        {#if layerType === 'Choropleth'}
          <svg viewBox="0 0 32 16" width="32" height="16">
            <rect
              x="0"
              y="0"
              width="32"
              height="16"
              fill={fill.scheme[i] ?? DEFAULT_FILL}
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
              fill={fill.scheme[i] ?? DEFAULT_FILL}
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
