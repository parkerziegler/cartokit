<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import { focus } from '$lib/actions/focus.svelte';
  import ColorRamp from '$lib/components/channel/shared/ColorRamp.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type {
    CartoKitHeatmapLayer,
    ColorRamp as ColorRampType,
    RampDirection
  } from '$lib/types';

  import { COLOR_RAMPS } from '$lib/utils/color/ramp';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

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

  function onClickRamp(ramp: ColorRampType) {
    const update = {
      type: 'heatmap-ramp' as const,
      layerId: layer.id,
      payload: { ramp }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-ramp',
        layerId: layer.id,
        payload: { ramp: layer.style.heatmap.ramp.id }
      }
    });

    dispatchLayerUpdate(update);
  }

  function onRampReverse() {
    const currentDirection = layer.style.heatmap.ramp.direction;
    const nextDirection: RampDirection =
      currentDirection === 'Forward' ? 'Reverse' : 'Forward';

    const update = {
      type: 'heatmap-ramp-direction' as const,
      layerId: layer.id,
      payload: { direction: nextDirection }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-ramp-direction',
        layerId: layer.id,
        payload: { direction: currentDirection }
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="heatmap-color-ramp">Ramp</FieldLabel>
  <div
    id="heatmap-color-ramp"
    class="flex grow items-center"
    bind:this={trigger}
    bind:offsetHeight
    bind:offsetWidth
  >
    <button
      onclick={onClickCurrentRamp}
      class="flex-1 border border-transparent p-2 focus-within:border-slate-600 hover:border-slate-600"
      {@attach onClickOutside({ callback: onClickOutsideCurrentRamp })}
    >
      <ColorRamp
        ramp={layer.style.heatmap.ramp.id}
        direction={layer.style.heatmap.ramp.direction}
      />
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
          {#each COLOR_RAMPS as ramp (ramp)}
            <li>
              <button
                onclick={() => onClickRamp(ramp)}
                use:focus={() => ramp === layer.style.heatmap.ramp.id}
                class="flex-1 p-2 hover:bg-slate-600"
              >
                <ColorRamp
                  {ramp}
                  direction={layer.style.heatmap.ramp.direction}
                />
              </button>
            </li>
          {/each}
        </ul>
      </Portal>
    {/if}
  </div>
  <button
    onclick={onRampReverse}
    data-testid="color-ramp-reverse-button"
    {@attach tooltip({
      content: 'Reverse Ramp'
    })}><ReverseIcon /></button
  >
</div>
