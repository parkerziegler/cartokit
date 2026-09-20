<script lang="ts">
  import ColorRampSelect from '$lib/components/color/ColorRampSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import ClassificationMethodSelect from '$lib/components/scale/ClassificationMethodSelect.svelte';
  import StepsSelect from '$lib/components/scale/StepCountSelect.svelte';
  import VisualizationTypeSelect from '$lib/components/scale/VisualizationTypeSelect.svelte';
  import type {
    CategoricalFill,
    ConstantFill,
    QuantitativeFill
  } from '$lib/types';

  interface Props {
    layerId: string;
    layerType: 'Choropleth' | 'Proportional Symbol' | 'Point';
    fill: QuantitativeFill | CategoricalFill | ConstantFill;
  }

  let { layerId, layerType, fill }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <VisualizationTypeSelect
    {layerId}
    {layerType}
    visualizationType={fill.type}
  />
  {#if fill.type === 'Constant'}
    <FillPicker {layerId} {fill} />
  {:else if fill.type === 'Categorical'}
    <AttributeSelect
      {layerId}
      visualizationType={fill.type}
      selected={fill.attribute}
      channel="fill"
    />
    <ColorSchemeSelect {layerId} scale={fill.scale} />
  {:else if fill.type === 'Quantitative'}
    <AttributeSelect
      {layerId}
      visualizationType={fill.type}
      selected={fill.attribute}
      channel="fill"
    />
    <ClassificationMethodSelect
      {layerId}
      attribute={fill.attribute}
      scale={fill.scale}
    />
    {#if fill.scale.type === 'Continuous'}
      <ColorRampSelect
        {layerId}
        channel="fill-color"
        ramp={fill.scale.interpolator}
      />
    {:else}
      <StepsSelect {layerId} scale={fill.scale} />
      <ColorSchemeSelect {layerId} scale={fill.scale} />
    {/if}
  {/if}
  <OpacityInput {layerId} channel="fill" style={fill} />
</div>
