<script lang="ts">
  import type { CartoKitFillLayer } from '$lib/types/CartoKitLayer';
  import { pluralize } from '$lib/utils/format';
  import { getLayerGeometryType } from '$lib/utils/geojson';

  export let layer: CartoKitFillLayer;
  $: geometryType = getLayerGeometryType(layer.data.geoJSON);
</script>

<div class="stack-h stack-h-xs ml-8 items-center">
  <svg viewBox="0 0 16 16" width="16" height="16">
    <rect
      x="0"
      y="0"
      width="16"
      height="16"
      fill={layer.style.fill?.color ?? 'none'}
      fill-opacity={layer.style.fill?.opacity ?? 0}
      stroke={layer.style.stroke?.color ?? 'none'}
      stroke-width={layer.style.stroke?.width ?? 0}
      stroke-opacity={layer.style.stroke?.opacity ?? 0}
    />
  </svg>
  <span
    >{layer.data.geoJSON.features.length}
    {pluralize(layer.data.geoJSON.features.length, geometryType)}</span
  >
</div>
