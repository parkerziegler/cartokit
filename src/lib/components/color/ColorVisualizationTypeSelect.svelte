<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { LayerType, VisualizationType } from '$lib/types';

  interface Props {
    layerId: string;
    layerType: LayerType;
    visualizationType: VisualizationType;
  }

  let { layerId, layerType, visualizationType }: Props = $props();

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
      case 'Line':
      case 'Polygon':
      case 'Dot Density':
        return [];
    }
  }

  function onChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    dispatchLayerUpdate({
      type: 'visualization-type',
      layerId,
      payload: {
        visualizationType: event.currentTarget.value as VisualizationType
      }
    });
  }

  let options = $derived(
    deriveOptions(layerType).map(({ label, value }) => ({
      value,
      label
    }))
  );
</script>

<Select
  title="Style by"
  {options}
  selected={visualizationType}
  id="color-style-by-select"
  {onChange}
/>
