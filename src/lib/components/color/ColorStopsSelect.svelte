<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { isChoroplethLayer } from '$lib/types/CartoKitLayer';

  const selected =
    $selectedLayer && isChoroplethLayer($selectedLayer)
      ? $selectedLayer.style.breaks.count
      : 3;
  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  function onChange(event: CustomEvent<{ value: number }>) {
    if ($map && $selectedLayer) {
      dispatchLayerUpdate({
        type: 'color-count',
        map: $map,
        layer: $selectedLayer,
        payload: {
          count: event.detail.value
        }
      });
    }
  }
</script>

<Select {options} {selected} on:change={onChange} title="Steps" />
