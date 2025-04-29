<script lang="ts">
  import * as d3 from 'd3';
  import type { Feature } from 'geojson';

  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { deriveExtent } from '$lib/interaction/scales';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { QuantitativeStyle } from '$lib/types';
  import { clickoutside } from '$lib/utils/actions';
  import { history } from '$lib/state/history.svelte';

  interface Props {
    layerId: string;
    style: QuantitativeStyle;
    features: Feature[];
    hideBreaksEditor: () => void;
  }

  let { layerId, style, features, hideBreaksEditor }: Props = $props();

  let [min, max] = $derived(deriveExtent(style.attribute, features));

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

<Menu class="w-80 overflow-auto">
  <MenuItem title="Set steps">
    {#snippet action()}
      <button onclick={hideBreaksEditor} aria-label="Close breaks editor">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/snippet}
    <div
      class="grid grid-cols-[0.75rem_1fr_1rem_1fr] gap-x-2 gap-y-1"
      use:clickoutside
      onclickoutside={hideBreaksEditor}
      data-testid="breaks-editor"
    >
      {#each [min, ...style.thresholds] as threshold, i (threshold)}
        <span
          class="h-6 self-center"
          style="background-color: {d3[style.scheme.id][style.count][i]};"
        ></span>
        <span class="self-center">{threshold.toFixed(2)}</span>
        <span class="self-center">to</span>
        <NumberInput
          value={style.thresholds[i] ?? max}
          step={0.01}
          class="self-center p-1"
          disabled={i === style.thresholds.length}
          onchange={onThresholdChange(i)}
        />
      {/each}
    </div>
  </MenuItem>
</Menu>
