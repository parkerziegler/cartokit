<script lang="ts">
  import ColorSchemePalette from '$lib/components/color/ColorSchemePalette.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme,
    QuantitativeStyle,
    CategoricalStyle
  } from '$lib/types';
  import { clickoutside } from '$lib/utils/actions';
  import {
    reverseQuantitativeColorScheme,
    reverseCategoricalColorScheme,
    QUANTITATIVE_COLOR_SCHEMES,
    QUANTITATIVE_COLOR_SCHEMES_REV,
    CATEGORICAL_COLOR_SCHEMES,
    CATEGORICAL_COLOR_SCHEMES_REV
  } from '$lib/utils/color';

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
  let schemeReversed = $state(false);

  let colors = $derived(
    style.type === 'Quantitative' ? style.scheme[style.count] : style.scheme
  );
  let quantitativeSchemes = $derived(
    schemeReversed ? QUANTITATIVE_COLOR_SCHEMES_REV : QUANTITATIVE_COLOR_SCHEMES
  );
  let categoricalSchemes = $derived(
    schemeReversed ? CATEGORICAL_COLOR_SCHEMES_REV : CATEGORICAL_COLOR_SCHEMES
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

  function dispatchSchemeUpdate(
    scheme: CategoricalColorScheme | QuantitativeColorScheme
  ) {
    const update = {
      type: 'color-scheme' as const,
      layerId,
      payload: {
        scheme
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'color-scheme',
        layerId,
        payload: {
          scheme: style.scheme
        }
      }
    });

    dispatchLayerUpdate(update);
  }

  function onClickScheme(
    scheme: CategoricalColorScheme | QuantitativeColorScheme
  ) {
    showOptions = false;

    dispatchSchemeUpdate(scheme);
  }

  function onSchemeReverse() {
    schemeReversed = !schemeReversed;

    const scheme =
      style.type === 'Quantitative'
        ? reverseQuantitativeColorScheme(style.scheme)
        : reverseCategoricalColorScheme(style.scheme);

    dispatchSchemeUpdate(scheme);
  }
</script>

<div class="stack-h stack-h-xs items-center">
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
      use:clickoutside
      onclickoutside={onClickOutsideCurrentScheme}
      class="flex-1"
    >
      <div class="flex h-4 w-full">
        {#each colors as color (color)}
          <span style="background-color: {color};" class="flex-1"></span>
        {/each}
      </div>
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
          {#if style.type === 'Quantitative'}
            {#each quantitativeSchemes as scheme (scheme[style.count][0])}
              <ColorSchemePalette
                colors={scheme[style.count]}
                active={scheme === style.scheme}
                onclickscheme={() => onClickScheme(scheme)}
              />
            {/each}
          {:else}
            {#each categoricalSchemes as scheme (scheme[0])}
              <ColorSchemePalette
                colors={scheme}
                active={scheme === style.scheme}
                onclickscheme={() => onClickScheme(scheme)}
              />
            {/each}
          {/if}
        </ul>
      </Portal>
    {/if}
  </div>
  <button onclick={onSchemeReverse} data-testid="color-scheme-reverse-button"
    ><ReverseIcon /></button
  >
</div>
