<script lang="ts">
  import type { CartoKitPointLayer } from '$lib/types/CartoKitLayer';
  import { getLayerGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitPointLayer;
  $: featureCount = layer.data.geoJSON.features.length;
  $: featureType = getLayerGeometryType(layer.data.geoJSON) ?? 'Feature';
  $: dimension = layer.style.size * 2 + (layer.style.stroke?.width ?? 0) * 2;
</script>

<div class="stack-h stack-h-xs ml-8 items-center">
  <svg
    viewBox={`0 0 ${dimension} ${dimension}`}
    width={dimension}
    height={dimension}
  >
    <circle
      cx={dimension / 2}
      cy={dimension / 2}
      r={layer.style.size}
      fill={layer.style.fill?.color ?? 'none'}
      fill-opacity={layer.style.fill?.opacity ?? 0}
      stroke={layer.style.stroke?.color ?? 'none'}
      stroke-width={layer.style.stroke?.width ?? 0}
      stroke-opacity={layer.style.stroke?.opacity ?? 0}
    />
  </svg>
  <span
    >{featureCount} {featureType + (featureType.length !== 1 ? 's' : '')}</span
  >
</div>
