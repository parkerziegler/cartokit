<script lang="ts">
  import type { CartoKitPolygonLayer } from '$lib/types';
  import { pluralize } from '$lib/utils/format';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

  interface Props {
    layer: CartoKitPolygonLayer;
  }

  let { layer }: Props = $props();
</script>

<div
  class={[
    'ml-8 flex items-center gap-2',
    layer.layout.visible ? 'opacity-100' : 'opacity-75'
  ]}
>
  <svg viewBox="0 0 16 16" width="16" height="16">
    <rect
      x="0"
      y="0"
      width="16"
      height="16"
      fill={layer.style.fill.visible ? layer.style.fill.color : 'transparent'}
      fill-opacity={layer.style.fill.visible ? layer.style.fill.opacity : 0}
      stroke={layer.style.stroke.visible
        ? layer.style.stroke.color
        : 'transparent'}
      stroke-width={layer.style.stroke.visible ? layer.style.stroke.width : 0}
      stroke-opacity={layer.style.stroke.visible
        ? layer.style.stroke.opacity
        : 0}
    />
  </svg>
  {#if layer.source.type === 'geojson'}
    <span
      >{layer.source.data.features.length}
      {pluralize(
        getFeatureCollectionGeometryType(layer.source.data),
        layer.source.data.features.length
      )}</span
    >
  {/if}
</div>
