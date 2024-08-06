<script lang="ts">
  import ColorSchemePalette from '$lib/components/color/ColorSchemePalette.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme,
    QuantitativeStyle,
    CategoricalStyle
  } from '$lib/types';
  import { clickOutside } from '$lib/utils/actions';
  import {
    reverseQuantitativeColorScheme,
    reverseCategoricalColorScheme,
    QUANTITATIVE_COLOR_SCHEMES,
    QUANTITATIVE_COLOR_SCHEMES_REV,
    CATEGORICAL_COLOR_SCHEMES,
    CATEGORICAL_COLOR_SCHEMES_REV
  } from '$lib/utils/color';

  export let layerId: string;
  export let style: QuantitativeStyle | CategoricalStyle;

  let showOptions = false;
  let offsetHeight = 0;
  let offsetWidth = 0;
  let x = 0;
  let y = 0;
  let schemeReversed = false;

  let trigger: HTMLDivElement;

  $: colors =
    style.type === 'Quantitative' ? style.scheme[style.count] : style.scheme;
  $: quantitativeSchemes = schemeReversed
    ? QUANTITATIVE_COLOR_SCHEMES_REV
    : QUANTITATIVE_COLOR_SCHEMES;
  $: categoricalSchemes = schemeReversed
    ? CATEGORICAL_COLOR_SCHEMES_REV
    : CATEGORICAL_COLOR_SCHEMES;

  const target = document.getElementById('map') ?? document.body;

  function onClick() {
    showOptions = !showOptions;
    ({ x, y } = trigger.getBoundingClientRect());
  }

  function onClickOutside() {
    showOptions = false;
  }

  function onSchemeSelect(
    event: CustomEvent<{
      scheme: QuantitativeColorScheme | CategoricalColorScheme;
    }>
  ) {
    dispatchLayerUpdate({
      type: 'color-scheme',
      layerId,
      payload: {
        scheme: event.detail.scheme
      }
    });

    showOptions = false;
  }

  function onSchemeReverse() {
    schemeReversed = !schemeReversed;

    const scheme =
      style.type === 'Quantitative'
        ? reverseQuantitativeColorScheme(style.scheme)
        : reverseCategoricalColorScheme(style.scheme);

    dispatchLayerUpdate({
      type: 'color-scheme',
      layerId,
      payload: {
        scheme
      }
    });
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
      on:click={onClick}
      use:clickOutside
      on:clickoutside={onClickOutside}
      class="flex-1"
    >
      <div class="flex h-4 w-full">
        {#each colors as color}
          <span style="background-color: {color};" class="flex-1" />
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
            {#each quantitativeSchemes as scheme}
              <ColorSchemePalette
                colors={scheme[style.count]}
                {scheme}
                active={scheme === style.scheme}
                on:click={onSchemeSelect}
              />
            {/each}
          {:else}
            {#each categoricalSchemes as scheme}
              <ColorSchemePalette
                colors={scheme}
                {scheme}
                active={scheme === style.scheme}
                on:click={onSchemeSelect}
              />
            {/each}
          {/if}
        </ul>
      </Portal>
    {/if}
  </div>
  <button on:click={onSchemeReverse} data-testid="color-scheme-reverse-button"
    ><ReverseIcon /></button
  >
</div>
