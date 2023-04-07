<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;

  $: selected = layer.style.breaks.count;
  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  function onChange(event: CustomEvent<{ value: number }>) {
    if ($map) {
      dispatchLayerUpdate({
        type: 'color-count',
        map: $map,
        layer,
        payload: {
          count: event.detail.value
        }
      });
    }
  }
</script>

<Select {options} {selected} on:change={onChange} title="Steps" />
