<script lang="ts">
  import * as d3 from 'd3';

  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type {
    QuantitativeColorScale,
    ContinuousColorScale
  } from '$lib/types';

  interface Props {
    layerId: string;
    scale: Exclude<QuantitativeColorScale, ContinuousColorScale>;
  }

  let { layerId, scale }: Props = $props();

  const options = d3.range(3, 10).map((_, i) => ({
    value: i + 3,
    label: `${i + 3}`
  }));

  async function onStepCountChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'fill-step-count',
      layerId,
      payload: {
        count: +event.currentTarget.value
      }
    };

    await applyDiff(diff);
  }
</script>

<Select
  {options}
  selected={scale.steps}
  title="Steps"
  id="fill-step-count-select"
  onchange={onStepCountChange}
/>
