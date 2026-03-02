<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import { focus } from '$lib/actions/focus.svelte';
  import ColorInterpolator from '$lib/components/channel/shared/ColorInterpolator.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type {
    ContinuousQuantitativeStyle,
    QuantitativeColorInterpolator,
    InterpolatorDirection
  } from '$lib/types';
  import { QUANTITATIVE_COLOR_INTERPOLATORS } from '$lib/utils/color/interpolator';

  interface Props {
    layerId: string;
    style: ContinuousQuantitativeStyle;
  }

  let { layerId, style }: Props = $props();

  let showOptions = $state(false);
  let offsetHeight = $state(0);
  let offsetWidth = $state(0);
  let x = $state(0);
  let y = $state(0);

  let trigger: HTMLDivElement;
  const target = document.getElementById('map') ?? document.body;

  function onClickCurrentInterpolator() {
    showOptions = !showOptions;
    ({ x, y } = trigger.getBoundingClientRect());
  }

  function onClickOutsideCurrentInterpolator() {
    showOptions = false;
  }

  async function onClickInterpolator(
    interpolator: QuantitativeColorInterpolator
  ) {
    showOptions = false;

    const diff: CartoKitDiff = {
      type: 'fill-color-interpolator',
      layerId,
      payload: {
        interpolator
      }
    };

    await applyDiff(diff);
  }

  async function onInterpolatorReverse() {
    const currentDirection = style.interpolator.direction;
    const nextDirection: InterpolatorDirection =
      currentDirection === 'Forward' ? 'Reverse' : 'Forward';

    const diff: CartoKitDiff = {
      type: 'fill-color-interpolator-direction',
      layerId,
      payload: {
        direction: nextDirection
      }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="color-interpolator">Interpolator</FieldLabel>
  <div
    id="color-interpolator"
    class="flex grow items-center border border-transparent p-2 focus-within:border-slate-600 hover:border-slate-600"
    bind:this={trigger}
    bind:offsetHeight
    bind:offsetWidth
  >
    <button
      onclick={onClickCurrentInterpolator}
      class="flex-1"
      {@attach onClickOutside({ callback: onClickOutsideCurrentInterpolator })}
    >
      <ColorInterpolator
        interpolator={style.interpolator.id}
        direction={style.interpolator.direction}
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
          {#each QUANTITATIVE_COLOR_INTERPOLATORS as interpolator (interpolator)}
            <li class="flex">
              <button
                onclick={() => onClickInterpolator(interpolator)}
                use:focus={() => interpolator === style.interpolator.id}
                class="flex-1 p-2 hover:bg-slate-600"
              >
                <ColorInterpolator
                  interpolator={interpolator}
                  direction={style.interpolator.direction}
                />
              </button>
            </li>
          {/each}
        </ul>
      </Portal>
    {/if}
  </div>
  <button
    onclick={onInterpolatorReverse}
    data-testid="color-interpolator-reverse-button"
    {@attach tooltip({
      content: 'Reverse Interpolator'
    })}><ReverseIcon /></button
  >
</div>
