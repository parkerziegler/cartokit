<script lang="ts">
  import * as d3 from 'd3';

  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { QuantitativeStyle } from '$lib/types';
  import { catalog } from '$lib/state/catalog.svelte';
  import { history } from '$lib/state/history.svelte';

  interface Props {
    layerId: string;
    style: QuantitativeStyle;
  }

  let { layerId, style }: Props = $props();
  let { min, max } = $derived(catalog.value[layerId][style.attribute]);

  function onThresholdChange(i: number) {
    return function handleThresholdChange(value: number) {
      const update = {
        type: 'color-threshold' as const,
        layerId,
        payload: {
          index: i,
          threshold: value
        }
      };

      history.undo.push({
        execute: update,
        invert: {
          type: 'color-threshold',
          layerId,
          payload: {
            index: i,
            threshold: style.thresholds[i]
          }
        }
      });

      dispatchLayerUpdate(update);
    };
  }
</script>

<div data-testid="breaks-editor" class="font-mono text-xs">
  {#each [min, ...style.thresholds] as threshold, i (threshold)}
    <div
      class="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-1 gap-y-2 border-b border-slate-600 last:border-b-0"
    >
      <div class="self-center justify-self-center">
        <span
          class="inline-block h-4 w-4 rounded-xs"
          style="background-color: {d3[style.scheme.id][style.count][i]};"
        ></span>
      </div>
      <NumberInput
        {min}
        {max}
        value={style.thresholds[i - 1] ?? min}
        step={0.01}
        class="self-center hover:border-transparent"
        disabled={i === 0}
        onchange={onThresholdChange(i - 1)}
      />
      <NumberInput
        {min}
        {max}
        value={style.thresholds[i] ?? max}
        step={0.01}
        class="self-center hover:border-transparent"
        disabled={i === style.thresholds.length}
        onchange={onThresholdChange(i)}
      />
    </div>
  {/each}
</div>
