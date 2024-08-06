<script lang="ts">
  import ClassificationMethodSelect from '$lib/components/classification/ClassificationMethodSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import ColorStepsSelect from '$lib/components/color/ColorStepsSelect.svelte';
  import ColorVisualizationTypeSelect from '$lib/components/color/ColorVisualizationTypeSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-2xs">
  <ColorVisualizationTypeSelect
    layerId={layer.id}
    visualizationType={layer.style.fill.type}
  />
  <AttributeSelect
    layerId={layer.id}
    geojson={layer.data.geojson}
    visualizationType={layer.style.fill.type}
    selected={layer.style.fill.attribute}
  />
  {#if layer.style.fill.type === 'Quantitative'}
    <ClassificationMethodSelect
      layerId={layer.id}
      style={layer.style.fill}
      features={layer.data.geojson.features}
    />
    <ColorStepsSelect layerId={layer.id} style={layer.style.fill} />
  {/if}
  <ColorSchemeSelect layerId={layer.id} style={layer.style.fill} />
  <OpacityInput layerId={layer.id} property="fill" style={layer.style.fill} />
</div>
