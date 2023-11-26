<script lang="ts">
  import type { CartoKitLineLayer } from '$lib/types/CartoKitLayer';
  import { getLayerGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitLineLayer;
  $: geometryType = getLayerGeometryType(layer.data.geoJSON);
</script>

<div class="stack-h stack-h-xs ml-8 items-center">
  <svg viewBox="0 0 16 16" width="16" height="16">
    <line
      x1="0"
      y1="8"
      x2="16"
      y2="8"
      stroke={layer.style.stroke.color}
      stroke-width={layer.style.stroke.width}
      stroke-opacity={layer.style.stroke.opacity}
    />
  </svg>
  <span
    >{layer.data.geoJSON.features.length}
    {geometryType + (geometryType.length !== 1 ? 's' : '')}</span
  >
</div>
