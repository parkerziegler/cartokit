<script lang="ts">
  import { deriveExtent, deriveThresholds } from '$lib/interaction/scales';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
  let stops: number[] = [];

  $: count = layer.style.fill.count;
  // This cast allows the calls to deriveQuantiles, dervieEqulaIntervals,
  // and deriveJenksBreaks to type check. The type of layer.style.fill.scheme[count]
  // is readonly string[]. These functions do not mutate the array in any way.
  $: colors = layer.style.fill.scheme[count] as string[];

  $: [min, max] = deriveExtent(
    layer.style.fill.attribute,
    layer.data.geoJSON.features
  );
  $: stops = deriveThresholds({
    scale: layer.style.fill.scale,
    layer,
    attribute: layer.style.fill.attribute,
    features: layer.data.geoJSON.features,
    range: colors
  });
</script>

<div class="stack stack-xs ml-8 text-white">
  <p>{layer.style.fill.attribute}</p>
  <div class="stack-h stack-h-xs rounded-md bg-slate-900">
    <ul class="stack stack-xs items-end">
      {#each [min, ...stops, max] as stop}
        <li class="stack-h stack-h-xs h-4 font-mono text-3xs">
          <span>{stop.toFixed(2)}</span>
          <span class="text-slate-400"> → </span>
        </li>
      {/each}
    </ul>
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
              fill-opacity={layer.style.fill.opacity}
              stroke={layer.style.stroke?.color ?? 'none'}
              stroke-width={layer.style.stroke?.width ?? '0'}
              stroke-opacity={layer.style.stroke?.opacity ?? '0'}
            />
          </svg>
        </li>
      {/each}
    </ul>
  </div>
</div>
