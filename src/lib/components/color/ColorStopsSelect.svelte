<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;

  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  function onChange(event: CustomEvent<{ value: string }>) {
    dispatchLayerUpdate({
      type: 'color-count',
      layer,
      payload: {
        count: +event.detail.value
      }
    });
  }
</script>

<Select
  {options}
  selected={layer.style.fill.count}
  on:change={onChange}
  title="Steps"
/>
