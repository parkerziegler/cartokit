<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { error } from '$lib/state/error.svelte';
  import type { LayerType, VisualizationType } from '$lib/types';

  interface Props {
    layerId: string;
    layerType: LayerType;
    visualizationType: VisualizationType;
  }

  let { layerId, layerType, visualizationType }: Props = $props();
  let options = $derived(
    deriveOptions(layerType).map(({ label, value }) => ({
      value,
      label
    }))
  );

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

  async function onVisualizationTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'fill-visualization-type',
      layerId,
      payload: {
        visualizationType: event.currentTarget.value as VisualizationType
      }
    };

    try {
      await applyDiff(diff);
    } catch (e) {
      error.set(
        e instanceof Error ? e.message : 'Failed to change visualization type.'
      );
    }
  }
</script>

<Select
  title="Style by"
  {options}
  selected={visualizationType}
  id="style-by-select"
  onchange={onVisualizationTypeChange}
/>
