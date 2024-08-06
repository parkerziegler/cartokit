<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { QuantitativeStyle } from '$lib/types';

  export let layerId: string;
  export let style: QuantitativeStyle;

  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  function onChange(event: CustomEvent<{ value: string }>) {
    dispatchLayerUpdate({
      type: 'color-count',
      layerId,
      payload: {
        count: +event.detail.value
      }
    });
  }
</script>

<Select
  {options}
  selected={style.count}
  title="Steps"
  id="color-steps-select"
  on:change={onChange}
/>
