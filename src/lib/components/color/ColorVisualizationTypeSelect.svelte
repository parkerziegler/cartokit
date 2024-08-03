<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { VisualizationType } from '$lib/types';

  export let layerId: string;
  export let visualizationType: VisualizationType;

  const options = [
    { label: 'Range', value: 'Quantitative' },
    { label: 'Categories', value: 'Categorical' }
  ].map(({ label, value }) => ({
    value,
    label
  }));

  function onChange(event: CustomEvent<{ value: VisualizationType }>) {
    dispatchLayerUpdate({
      type: 'fill-visualization',
      layerId,
      payload: {
        type: event.detail.value
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
