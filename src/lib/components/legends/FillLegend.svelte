<script lang="ts">
  import type { CartoKitFillLayer } from '$lib/types/CartoKitLayer';
  import { getFeatureCollectionType } from '$lib/utils/geojson';

  export let layer: CartoKitFillLayer;
  $: featureCount = layer.data.geoJSON.features.length;
  $: featureType = getFeatureCollectionType(layer.data.geoJSON) ?? 'Feature';
</script>

<div class="stack-h stack-h-xs ml-8 items-center">
  <svg viewBox="0 0 16 16" width="16" height="16">
    <rect
      x="0"
      y="0"
      width="16"
      height="16"
      fill={layer.style.fill?.color ?? 'transparent'}
      fill-opacity={layer.style.fill?.opacity ?? 1}
      stroke={layer.style.stroke?.color ?? 'transparent'}
      stroke-width={layer.style.stroke?.width ?? 0}
      stroke-opacity={layer.style.stroke?.opacity ?? 1}
    />
  </svg>
  <span
    >{featureCount} {featureType + (featureType.length !== 1 ? 's' : '')}</span
  >
</div>
