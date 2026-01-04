<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import { focus } from '$lib/actions/focus.svelte';
  import ColorPalette from '$lib/components/channel/shared/ColorPalette.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme,
    QuantitativeStyle,
    CategoricalStyle,
    SchemeDirection
  } from '$lib/types';
  import {
    QUANTITATIVE_COLOR_SCHEMES,
    CATEGORICAL_COLOR_SCHEMES
  } from '$lib/utils/color/scheme';

  interface Props {
    layerId: string;
    style: QuantitativeStyle | CategoricalStyle;
  }

  let { layerId, style }: Props = $props();

  let showOptions = $state(false);
  let offsetHeight = $state(0);
  let offsetWidth = $state(0);
  let x = $state(0);
  let y = $state(0);

  let schemes = $derived(
    style.type === 'Quantitative'
      ? QUANTITATIVE_COLOR_SCHEMES
      : CATEGORICAL_COLOR_SCHEMES
  );

  let trigger: HTMLDivElement;
  const target = document.getElementById('map') ?? document.body;

  function onClickCurrentScheme() {
    showOptions = !showOptions;
    ({ x, y } = trigger.getBoundingClientRect());
  }

  function onClickOutsideCurrentScheme() {
    showOptions = false;
  }

  async function dispatchSchemeUpdate(
    scheme: CategoricalColorScheme | QuantitativeColorScheme
  ) {
    const diff: CartoKitDiff = {
      type: 'fill-color-scheme',
      layerId,
      payload: {
        scheme
      }
    };

    await applyDiff(diff);
  }

  async function onClickScheme(
    scheme: CategoricalColorScheme | QuantitativeColorScheme
  ) {
    showOptions = false;

    await dispatchSchemeUpdate(scheme);
  }

  async function onSchemeReverse() {
    const currentDirection = style.scheme.direction;
    const nextDirection: SchemeDirection =
      currentDirection === 'Forward' ? 'Reverse' : 'Forward';

    const diff: CartoKitDiff = {
      type: 'fill-color-scheme-direction',
      layerId,
      payload: {
        direction: nextDirection
      }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="color-scheme">Scheme</FieldLabel>
  <div
    id="color-scheme"
    class="flex grow items-center border border-transparent p-2 focus-within:border-slate-600 hover:border-slate-600"
    bind:this={trigger}
    bind:offsetHeight
    bind:offsetWidth
  >
    <button
      onclick={onClickCurrentScheme}
      class="flex-1"
      {@attach onClickOutside({ callback: onClickOutsideCurrentScheme })}
    >
      <ColorPalette
        scheme={style.scheme.id}
        direction={style.scheme.direction}
        count={style.type === 'Quantitative' ? style.count : undefined}
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
          {#each schemes as scheme (scheme)}
            <li class="flex">
              <button
                onclick={() => onClickScheme(scheme)}
                use:focus={() => scheme === style.scheme.id}
                class="flex-1 p-2 hover:bg-slate-600"
              >
                <ColorPalette
                  {scheme}
                  direction={style.scheme.direction}
                  count={style.type === 'Quantitative'
                    ? style.count
                    : undefined}
                />
              </button>
            </li>
          {/each}
        </ul>
      </Portal>
    {/if}
  </div>
  <button
    onclick={onSchemeReverse}
    data-testid="color-scheme-reverse-button"
    {@attach tooltip({
      content: 'Reverse Scheme'
    })}><ReverseIcon /></button
  >
</div>
