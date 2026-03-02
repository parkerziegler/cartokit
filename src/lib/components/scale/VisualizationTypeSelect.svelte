<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { LayerType, VisualizationType } from '$lib/types';

  type StyleByOption = 'Constant' | 'Range' | 'Categorical';

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
  let selected = $derived(deriveSelected(visualizationType));

  function deriveOptions(
    layerType: LayerType
  ): { label: string; value: StyleByOption }[] {
    switch (layerType) {
      case 'Choropleth':
        return [
          { label: 'Range', value: 'Range' },
          { label: 'Categories', value: 'Categorical' }
        ];
      case 'Proportional Symbol':
        return [
          { label: 'Single color', value: 'Constant' },
          { label: 'Range', value: 'Range' },
          { label: 'Categories', value: 'Categorical' }
        ];
      case 'Point':
        return [
          { label: 'Single color', value: 'Constant' },
          { label: 'Range', value: 'Range' },
          { label: 'Categories', value: 'Categorical' }
        ];
      case 'Dot Density':
      case 'Heatmap':
      case 'Line':
      case 'Polygon':
        return [];
    }
  }

  function deriveSelected(visualizationType: VisualizationType): StyleByOption {
    switch (visualizationType) {
      case 'DiscreteQuantitative':
      case 'ContinuousQuantitative':
        return 'Range';
      case 'Categorical':
        return 'Categorical';
      case 'Constant':
        return 'Constant';
    }
  }

  async function onVisualizationTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const option = event.currentTarget.value as StyleByOption;
    const currentVisualizationType = visualizationType;
    const nextVisualizationType: VisualizationType =
      option === 'Range'
        ? currentVisualizationType === 'ContinuousQuantitative'
          ? 'ContinuousQuantitative'
          : 'DiscreteQuantitative'
        : (option as VisualizationType);

    const diff: CartoKitDiff = {
      type: 'fill-visualization-type',
      layerId,
      payload: {
        visualizationType: nextVisualizationType
      }
    };

    await applyDiff(diff);
  }
</script>

<Select
  title="Style by"
  {options}
  {selected}
  id="style-by-select"
  onchange={onVisualizationTypeChange}
/>
