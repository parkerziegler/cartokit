<script lang="ts">
  import * as d3 from 'd3';

  import { deriveExtent } from '$lib/interaction/scales';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitProportionalSymbolLayer;

  $: sizeMin = layer.style.size.min;
  $: sizeMax = layer.style.size.max;
  $: [_min, max] = deriveExtent(layer.attribute, layer.data.geoJSON.features);

  const padding = { top: 4, right: 4, bottom: 4, left: 4 };
  // Dynamically compute the label width based on the max value.
  $: labelWidth = max.toFixed(2).length * 9;

  $: scale = d3.scaleLinear(
    [sizeMin, sizeMax],
    deriveExtent(layer.attribute, layer.data.geoJSON.features)
  );
  $: intervals = [
    {
      size: (sizeMax * 2) / 3,
      value: scale((sizeMax * 2) / 3)
    },
    { size: sizeMax / 3, value: scale(sizeMax / 3) }
  ];
</script>

<div class="stack stack-xs ml-8">
  <span
    style="margin-left: {sizeMax * 2 + padding.left * 2 + padding.right * 2}px;"
    >{layer.attribute}</span
  >
  <svg
    viewBox="0 0 {sizeMax * 2 +
      padding.left +
      padding.right +
      labelWidth} {sizeMax * 2 + padding.top + padding.bottom}"
    height={sizeMax * 2 + padding.top + padding.bottom}
    width={sizeMax * 2 + padding.left + padding.right + labelWidth}
  >
    <circle
      r={sizeMax}
      cx={sizeMax + padding.left}
      cy={sizeMax + padding.top}
      stroke="#ffffff"
      fill={layer.style.fill}
    />
    <text
      x={sizeMax * 2 + padding.left * 2 + padding.right * 2}
      y={12}
      fill="#ffffff"
      font-size="0.625rem">{max.toFixed(2)}</text
    >
    {#each intervals as interval}
      <circle
        r={interval.size}
        cx={sizeMax + padding.left}
        cy={sizeMax * 2 - interval.size + padding.top}
        stroke="#ffffff"
        fill={layer.style.fill}
      />
      <text
        x={sizeMax * 2 + padding.left * 2 + padding.right * 2}
        y={sizeMax * 2 - interval.size * 2 + padding.top + 6}
        fill="#ffffff"
        font-size="0.625rem">{interval.value.toFixed(2)}</text
      >
    {/each}
  </svg>
</div>
