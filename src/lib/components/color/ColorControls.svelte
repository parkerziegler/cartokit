<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import ClassificationMethodSelect from '$lib/components/classification/ClassificationMethodSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import ColorStepsSelect from '$lib/components/color/ColorStepsSelect.svelte';
  import ColorVisualizationTypeSelect from '$lib/components/color/ColorVisualizationTypeSelect.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  interface Props {
    layerId: string;
    layerType: 'Choropleth' | 'Proportional Symbol' | 'Point';
    geojson: FeatureCollection;
    fill: QuantitativeFill | CategoricalFill | ConstantFill;
  }

  let { layerId, layerType, geojson, fill }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <ColorVisualizationTypeSelect
    {layerId}
    {layerType}
    visualizationType={fill.type}
  />
  {#if fill.type === 'Constant'}
    <FillPicker {layerId} {fill} />
  {:else if fill.type === 'Categorical'}
    <AttributeSelect
      {layerId}
      {geojson}
      visualizationType={fill.type}
      selected={fill.attribute}
      channel="fill"
    />
    <ColorSchemeSelect {layerId} style={fill} />
  {:else if fill.type === 'Quantitative'}
    <AttributeSelect
      {layerId}
      {geojson}
      visualizationType={fill.type}
      selected={fill.attribute}
      channel="fill"
    />
    <ClassificationMethodSelect {layerId} style={fill} />
    <ColorStepsSelect {layerId} style={fill} />
    <ColorSchemeSelect {layerId} style={fill} />
  {/if}
  <OpacityInput {layerId} channel="fill" style={fill} />
</div>
