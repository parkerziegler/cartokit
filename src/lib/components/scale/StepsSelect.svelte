<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
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

  function onStepsChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'fill-step-count',
      layerId,
      payload: {
        count: +event.currentTarget.value
      }
    };

    applyDiff(diff);
  }
</script>

<Select
  {options}
  selected={style.count}
  title="Steps"
  id="fill-step-count-select"
  onchange={onStepsChange}
/>
