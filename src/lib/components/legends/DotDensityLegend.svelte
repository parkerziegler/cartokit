<script lang="ts">
  import type { CartoKitDotDensityLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitDotDensityLayer;
</script>

<div class="stack stack-xs ml-8">
  <span>{layer.style.dots.attribute}</span>
  <div class="stack-h stack-h-xs items-center">
    <svg
      viewBox="0 0 {layer.style.dots.size * 2} {layer.style.dots.size * 2}"
      width={layer.style.dots.size * 2}
      height={layer.style.dots.size * 2}
    >
      <circle
        r={layer.style.dots.size}
        cx={layer.style.dots.size}
        cy={layer.style.dots.size}
        fill={layer.style.fill?.color ?? 'none'}
        fill-opacity={layer.style.fill?.opacity ?? '0'}
        stroke={layer.style.stroke?.color ?? 'none'}
        stroke-width={layer.style.stroke?.width ?? '0'}
        stroke-opacity={layer.style.stroke?.opacity ?? '0'}
      />
    </svg>
    <span class="text-3xs">1 dot = {layer.style.dots.value} units</span>
  </div>
</div>
