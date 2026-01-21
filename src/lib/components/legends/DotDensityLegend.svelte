<script lang="ts">
  import type { CartoKitDotDensityLayer } from '$lib/types';

  interface Props {
    layer: CartoKitDotDensityLayer;
  }

  let { layer }: Props = $props();
  let dimension = $derived(
    layer.style.size * 2 +
      (layer.style.stroke.visible ? layer.style.stroke.width : 0) * 2
  );
</script>

<div
  class={[
    'ml-8 flex flex-col gap-2',
    layer.layout.visible ? 'opacity-100' : 'opacity-75'
  ]}
>
  <span>{layer.style.dot.attribute}</span>
  <div class="flex items-center gap-2">
    <svg
      viewBox="0 0 {dimension} {dimension}"
      width={dimension}
      height={dimension}
    >
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={layer.style.size}
        fill={layer.style.fill.visible ? layer.style.fill.color : 'none'}
        fill-opacity={layer.style.fill.visible ? layer.style.fill.opacity : 0}
        stroke={layer.style.stroke.visible ? layer.style.stroke.color : 'none'}
        stroke-width={layer.style.stroke.visible ? layer.style.stroke.width : 0}
        stroke-opacity={layer.style.stroke.visible
          ? layer.style.stroke.opacity
          : 0}
      />
    </svg>
    <span class="text-3xs">1 dot = {layer.style.dot.value} units</span>
  </div>
</div>
