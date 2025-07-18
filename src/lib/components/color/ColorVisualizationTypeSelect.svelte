<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
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
      case 'Dot Density':
      case 'Heatmap':
      case 'Line':
      case 'Polygon':
        return [];
    }
  }

  function onVisualizationTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const update = {
      type: 'visualization-type' as const,
      layerId,
      payload: {
        visualizationType: event.currentTarget.value as VisualizationType
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'visualization-type',
        layerId,
        payload: {
          visualizationType
        }
      }
    });

    dispatchLayerUpdate(update);
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
  onchange={onVisualizationTypeChange}
/>
