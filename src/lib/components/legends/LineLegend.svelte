<script lang="ts">
  import type { CartoKitLineLayer } from '$lib/types';
  import { pluralize } from '$lib/utils/format';
  import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

  interface Props {
    layer: CartoKitLineLayer;
  }

  let { layer }: Props = $props();
</script>

<div
  class={[
    'ml-8 flex items-center gap-2',
    layer.layout.visible ? 'opacity-100' : 'opacity-75'
  ]}
>
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
