<script lang="ts">
  import type { Feature } from 'geojson';

  import { deriveExtent, deriveThresholds } from '$lib/interaction/scales';
  import type { CartoKitChoroplethLayer, QuantitativeFill } from '$lib/types';

  export let fill: QuantitativeFill;
  export let stroke: CartoKitChoroplethLayer['style']['stroke'];
  export let features: Feature[];

  let stops: number[] = [];
  $: colors = fill.scheme[fill.count] as string[];

  $: [min, max] = deriveExtent(fill.attribute, features);
  $: stops = deriveThresholds({
    method: fill.method,
    attribute: fill.attribute,
    features: features,
    range: colors,
    thresholds: fill.thresholds
  });
</script>

<div class="stack stack-xs ml-8 text-white">
  <p>{fill.attribute}</p>
  <div class="stack-h stack-h-xs rounded-md bg-slate-900">
    <ul class="stack stack-xs mt-3">
      {#each colors as color}
        <li class="stack stack-xs stack-h stack-h-xs">
          <svg viewBox="0 0 32 16" width="32" height="16">
            <rect
              x="0"
              y="0"
              width="32"
              height="16"
              fill={color}
              fill-opacity={fill.opacity}
              stroke={stroke?.color ?? 'none'}
              stroke-width={stroke?.width ?? '0'}
              stroke-opacity={stroke?.opacity ?? '0'}
            />
          </svg>
        </li>
      {/each}
    </ul>
    <ul class="stack stack-xs">
      {#each [min, ...stops, max] as stop}
        <li class="stack-h stack-h-xs h-4 font-mono text-3xs">
          <span class="text-slate-400"> → </span>
          <span>{stop.toFixed(2)}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
