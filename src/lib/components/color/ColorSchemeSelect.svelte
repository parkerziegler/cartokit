<script lang="ts">
  import { onMount } from 'svelte';

  import ColorSchemeList from '$lib/components/color/ColorSchemeList.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer, ColorScheme } from '$lib/types';
  import { clickOutside } from '$lib/utils/actions';
  import {
    reverseColorScheme,
    COLOR_SCHEMES,
    COLOR_SCHEMES_REV
  } from '$lib/utils/color';

  export let layer: CartoKitChoroplethLayer;

  $: colors = layer.style.fill.scheme[layer.style.fill.count];

  let showOptions = false;
  let offsetHeight = 0;
  let x = 0;
  let y = 0;
  let trigger: HTMLButtonElement;
  let firstScheme: HTMLButtonElement;
  let schemeReversed = false;

  const target = document.getElementById('map') ?? document.body;

  onMount(() => {
    ({ y } = trigger.getBoundingClientRect());
  });

  function onClick() {
    showOptions = !showOptions;
    ({ x } = trigger.getBoundingClientRect());
  }

  function onClickOutside() {
    showOptions = false;
  }

  function onSchemeSelect(scheme: ColorScheme) {
    dispatchLayerUpdate({
      type: 'color-scheme',
      layer,
      payload: {
        scheme
      }
    });

    showOptions = false;
  }

  function onSchemeReverse() {
    schemeReversed = !schemeReversed;

    dispatchLayerUpdate({
      type: 'color-scheme',
      layer,
      payload: {
        scheme: reverseColorScheme(layer.style.fill.scheme)
      }
    });
  }

  $: if (showOptions && firstScheme) {
    firstScheme.focus();
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="color-scheme">Color Scheme</FieldLabel>
  <div
    id="color-scheme"
    class="flex items-center border border-transparent p-2 focus-within:border-slate-600 hover:border-slate-600"
  >
    <button
      on:click={onClick}
      use:clickOutside
      on:clickoutside={onClickOutside}
      bind:offsetHeight
      bind:this={trigger}
    >
      <ColorSchemeList {colors} />
    </button>
    {#if showOptions}
      <Portal
        {target}
        class="absolute z-10"
        style="top: {offsetHeight + y + 10}px; left: {x}px;"
      >
        <ul
          class="flex max-h-44 flex-col overflow-auto rounded-md border border-slate-600 bg-slate-900 py-2 shadow-lg"
        >
          {#each schemeReversed ? COLOR_SCHEMES_REV : COLOR_SCHEMES as scheme, i}
            {#if i === 0}
              <button
                on:click={() => onSchemeSelect(scheme)}
                class="first-scheme px-4 py-2 hover:bg-slate-600"
                bind:this={firstScheme}
              >
                <ColorSchemeList {colors} />
              </button>
            {:else}
              <button
                on:click={() => onSchemeSelect(scheme)}
                class="px-4 py-2 hover:bg-slate-600"
              >
                <ColorSchemeList {colors} />
              </button>
            {/if}
          {/each}
        </ul>
      </Portal>
    {/if}
  </div>
  <button on:click={onSchemeReverse} data-testid="color-scheme-reverse-button"
    ><ReverseIcon /></button
  >
</div>

<style>
  .first-scheme:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
