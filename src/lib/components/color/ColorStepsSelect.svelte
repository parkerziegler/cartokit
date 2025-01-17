<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { QuantitativeStyle } from '$lib/types';

  interface Props {
    layerId: string;
    style: QuantitativeStyle;
  }

  let { layerId, style }: Props = $props();

  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  function onColorStepsChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    dispatchLayerUpdate({
      type: 'color-count',
      layerId,
      payload: {
        count: +event.currentTarget.value
      }
    });
  }
</script>

<Select
  {options}
  selected={style.count}
  title="Steps"
  id="color-steps-select"
  onchange={onColorStepsChange}
/>
