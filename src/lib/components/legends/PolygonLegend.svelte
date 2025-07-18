<script lang="ts">
  import type { CartoKitPolygonLayer } from '$lib/types';
  import { pluralize } from '$lib/utils/format';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

  interface Props {
    layer: CartoKitPolygonLayer;
  }

  let { layer }: Props = $props();

  let geometryType = $derived(
    getFeatureCollectionGeometryType(layer.data.geojson)
  );
</script>

<div class="ml-8 flex items-center gap-2">
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
    >{layer.data.geojson.features.length}
    {pluralize(geometryType, layer.data.geojson.features.length)}</span
  >
</div>
