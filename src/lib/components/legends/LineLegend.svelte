<script lang="ts">
  import type { CartoKitLineLayer } from '$lib/types';
  import { pluralize } from '$lib/utils/format';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

  interface Props {
    layer: CartoKitLineLayer;
  }

  let { layer }: Props = $props();

  let geometryType = $derived(
    getFeatureCollectionGeometryType(layer.data.geojson)
  );
</script>

<div class="ml-8 flex items-center gap-2">
  <svg
    viewBox="0 0 16 {layer.style.stroke.width}"
    width="16"
    height={layer.style.stroke.width}
  >
    <line
      x1="0"
      y1={layer.style.stroke.width / 2}
      x2="16"
      y2={layer.style.stroke.width / 2}
      stroke={layer.style.stroke.color}
      stroke-width={layer.style.stroke.width}
      stroke-opacity={layer.style.stroke.opacity}
    />
  </svg>
  <span
    >{layer.data.geojson.features.length}
    {pluralize(geometryType, layer.data.geojson.features.length)}</span
  >
</div>
