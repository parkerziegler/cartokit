<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import { focus } from '$lib/actions/focus.svelte';
  import ColorRamp from '$lib/components/channel/shared/ColorRamp.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { QuantitativeColorRamp, RampDirection } from '$lib/types';
  import { QUANTITATIVE_COLOR_RAMPS } from '$lib/utils/color/ramp';

  interface Props {
    layerId: string;
    channel: 'heatmap-color' | 'fill-color';
    ramp: { id: QuantitativeColorRamp; direction: RampDirection };
  }

  let { layerId, channel, ramp }: Props = $props();

  const target = document.getElementById('map') ?? document.body;
  let trigger: HTMLDivElement;

  let offsetHeight = $state(0);
  let offsetWidth = $state(0);
  let x = $state(0);
  let y = $state(0);
  let showOptions = $state(false);

  function onClickCurrentRamp() {
    showOptions = !showOptions;
    ({ x, y } = trigger.getBoundingClientRect());
  }

  function onClickOutsideCurrentRamp() {
    showOptions = false;
  }

  async function onClickRamp(id: QuantitativeColorRamp) {
    showOptions = false;

    const diff: CartoKitDiff =
      channel === 'heatmap-color'
        ? { type: 'heatmap-ramp', layerId, payload: { ramp: id } }
        : { type: 'fill-color-ramp', layerId, payload: { ramp: id } };

    await applyDiff(diff);
  }

  async function onRampReverse() {
    const nextDirection: RampDirection =
      ramp.direction === 'Forward' ? 'Reverse' : 'Forward';

    const diff: CartoKitDiff =
      channel === 'heatmap-color'
        ? {
            type: 'heatmap-ramp-direction',
            layerId,
            payload: { direction: nextDirection }
          }
        : {
            type: 'fill-color-ramp-direction',
            layerId,
            payload: { direction: nextDirection }
          };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="{channel}-ramp">Ramp</FieldLabel>
  <div
    id="{channel}-ramp"
    class="flex grow items-center border border-transparent p-2 focus-within:border-slate-600 hover:border-slate-600"
    bind:this={trigger}
    bind:offsetHeight
    bind:offsetWidth
  >
    <button
      onclick={onClickCurrentRamp}
      class="flex-1"
      {@attach onClickOutside({ callback: onClickOutsideCurrentRamp })}
    >
      <ColorRamp ramp={ramp.id} direction={ramp.direction} />
    </button>
    {#if showOptions}
      <Portal
        {target}
        class="absolute z-10"
        style="top: {offsetHeight +
          y +
          4}px; left: {x}px; width: {offsetWidth}px;"
      >
        <ul
          class="flex max-h-44 flex-col overflow-auto rounded-md border border-slate-600 bg-slate-900 shadow-lg"
        >
          {#each QUANTITATIVE_COLOR_RAMPS as rampOption (rampOption)}
            <li>
              <button
                onclick={() => onClickRamp(rampOption)}
                use:focus={() => rampOption === ramp.id}
                class="w-full p-2 hover:bg-slate-700"
              >
                <ColorRamp ramp={rampOption} direction={ramp.direction} />
              </button>
            </li>
          {/each}
        </ul>
      </Portal>
    {/if}
  </div>
  <button
    onclick={onRampReverse}
    data-testid="{channel}-ramp-reverse-button"
    {@attach tooltip({ content: 'Reverse Ramp' })}><ReverseIcon /></button
  >
</div>
