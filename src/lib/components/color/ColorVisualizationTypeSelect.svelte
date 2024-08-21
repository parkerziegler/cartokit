<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { LayerType, VisualizationType } from '$lib/types';

  export let layerId: string;
  export let layerType: LayerType;
  export let visualizationType: VisualizationType;

  $: options = deriveOptions(layerType).map(({ label, value }) => ({
    value,
    label
  }));

  function deriveOptions(
    layerType: LayerType
  ): { label: string; value: VisualizationType }[] {
    switch (layerType) {
      case 'Choropleth':
        return [
          { label: 'Range', value: 'Quantitative' },
          { label: 'Categories', value: 'Categorical' }
        ];
      case 'Proportional Symbol':
      case 'Point':
        return [
          { label: 'Single color', value: 'Constant' },
          { label: 'Range', value: 'Quantitative' },
          { label: 'Categories', value: 'Categorical' }
        ];
      default:
        return [];
    }
  }

  function onChange(event: CustomEvent<{ value: VisualizationType }>) {
    dispatchLayerUpdate({
      type: 'visualization-type',
      layerId,
      payload: {
        visualizationType: event.detail.value
      }
    });
  }
</script>

<Select
  title="Style by"
  {options}
  selected={visualizationType}
  id="color-style-by-select"
  on:change={onChange}
/>
