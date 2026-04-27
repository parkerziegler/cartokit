<script lang="ts">
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import type {
    ContinuousColorScale,
    QuantitativeColorScale
  } from '$lib/types';
  import { materializeColorScheme } from '$lib/utils/color/scheme';

  interface Props {
    layerId: string;
    attribute: string;
    scale: Exclude<QuantitativeColorScale, ContinuousColorScale>;
  }

  let { layerId, attribute, scale }: Props = $props();
  let { min, max } = $derived(catalog.value[layerId][attribute]);
  let colors = $derived(
    materializeColorScheme(scale.scheme.id, scale.scheme.direction, scale.steps)
  );

  function onThresholdChange(i: number) {
    return async function handleThresholdChange(value: number) {
      const diff: CartoKitDiff = {
        type: 'fill-step-value',
        layerId,
        payload: {
          step: i,
          value
        }
      };

      await applyDiff(diff);
    };
  }
</script>

<div data-testid="breaks-editor" class="font-mono text-xs">
  {#each [min, ...scale.thresholds] as threshold, i (threshold)}
    <div
      class="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-1 gap-y-2 border-b border-slate-600 last:border-b-0"
    >
      <div class="self-center justify-self-center">
        <span
          class="inline-block h-4 w-4 rounded-xs"
          style="background-color: {colors[i]};"
        ></span>
      </div>
      <NumberInput
        {min}
        {max}
        value={scale.thresholds[i - 1] ?? min}
        step={0.01}
        class="self-center hover:border-transparent"
        disabled={i === 0}
        onchange={onThresholdChange(i - 1)}
      />
      <NumberInput
        {min}
        {max}
        value={scale.thresholds[i] ?? max}
        step={0.01}
        class="self-center hover:border-transparent"
        disabled={i === scale.thresholds.length}
        onchange={onThresholdChange(i)}
      />
    </div>
  {/each}
</div>
