<script lang="ts">
  import type { CartoKitFillLayer } from '$lib/types/CartoKitLayer';
  import { getFeatureCollectionType } from '$lib/utils/geojson';

  export let layer: CartoKitFillLayer;
  $: featureCount = layer.data.geoJSON.features.length;
  $: featureType = getFeatureCollectionType(layer.data.geoJSON) ?? 'Feature';
</script>

<div class="stack-h stack-h-xs ml-8 items-center">
  <span class="h-4 w-4" style="background-color: {layer.style.fill};" />
  <span
    >{featureCount} {featureType + (featureType.length !== 1 ? 's' : '')}</span
  >
</div>
