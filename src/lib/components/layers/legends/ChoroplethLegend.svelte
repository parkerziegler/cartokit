<script lang="ts">
  import { deriveExtent, deriveThresholds } from '$lib/interaction/scales';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
  let stops: number[] = [];

  $: count = layer.style.breaks.count;
  // This cast allows the calls to deriveQuantiles, dervieEqulaIntervals,
  // and deriveJenksBreaks to type check. The type of layer.style.breaks.scheme[count]
  // is readonly string[]. These functions do not mutate the array in anyway.
  $: colors = layer.style.breaks.scheme[count] as string[];

  $: [min, max] = deriveExtent(layer.attribute, layer.data.geoJSON.features);
  $: stops = deriveThresholds({
    scale: layer.style.breaks.scale,
    layer,
    attribute: layer.attribute,
    features: layer.data.geoJSON.features,
    range: colors
  });
</script>

<div class="stack stack-xs text-white">
  <p>{layer.attribute}</p>
  <div class="stack-h stack-h-xs rounded-md bg-slate-900">
    <ul class="stack stack-xs items-end">
      {#each [min, ...stops, max] as stop}
        <li class="stack-h stack-h-xs h-4 font-mono text-2xs">
          <span>{stop.toFixed(2)}</span>
          <span class="text-slate-400"> → </span>
        </li>
      {/each}
    </ul>
    <ul class="stack stack-xs mt-3">
      {#each colors as color}
        <li class="stack stack-xs stack-h stack-h-xs">
          <span class="h-4 w-8" style="background-color: {color}" />
        </li>
      {/each}
    </ul>
  </div>
</div>
