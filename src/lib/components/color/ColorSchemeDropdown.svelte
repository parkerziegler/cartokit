<script lang="ts">
  import { onMount } from 'svelte';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import ReverseIcon from '$lib/components/icons/ReverseIcon.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
  import {
    type ColorScheme,
    COLOR_SCHEMES,
    COLOR_SCHEMES_REV
  } from '$lib/types/color';
  import { reverseD3ColorScheme } from '$lib/utils/color';

  export let layer: CartoKitChoroplethLayer;

  $: count = layer.style.fill.count;
  $: colors = layer.style.fill.scheme[count];

  let showDropdown = false;
  let offsetHeight = 0;
  let y = 0;
  let trigger: HTMLButtonElement;
  let firstScheme: HTMLButtonElement;
  let schemeReversed = false;

  onMount(() => {
    const { y: triggerY } = trigger.getBoundingClientRect();
    y = triggerY;
  });

  function togglePaletteDropdown() {
    showDropdown = !showDropdown;
  }

  function onSchemeSelect(scheme: ColorScheme) {
    dispatchLayerUpdate({
      type: 'color-scheme',
      layer,
      payload: {
        scheme
      }
    });

    togglePaletteDropdown();
  }

  function onSchemeReverse() {
    schemeReversed = !schemeReversed;

    dispatchLayerUpdate({
      type: 'color-scheme',
      layer,
      payload: {
        scheme: reverseD3ColorScheme(layer.style.fill.scheme)
      }
    });
  }

  $: if (showDropdown && firstScheme) {
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
      on:click={togglePaletteDropdown}
      bind:offsetHeight
      bind:this={trigger}
    >
      <ul class="flex">
        {#each colors as color}
          <li>
            <span style="background-color: {color};" class="block h-4 w-5" />
          </li>
        {/each}
      </ul>
    </button>
    {#if showDropdown}
      <ul
        class="fixed flex max-h-44 flex-col overflow-auto rounded-md border border-slate-600 bg-slate-900 py-2 shadow-lg"
        style="top: {offsetHeight + y + 10}px;"
      >
        {#each schemeReversed ? COLOR_SCHEMES_REV : COLOR_SCHEMES as scheme, i}
          {#if i === 0}
            <button
              on:click={() => onSchemeSelect(scheme)}
              class="first-scheme px-4 py-2 hover:bg-slate-600"
              bind:this={firstScheme}
            >
              <ul class="flex">
                {#each scheme[count] as color}
                  <li>
                    <span
                      style="background-color: {color};"
                      class="block h-4 w-6"
                    />
                  </li>
                {/each}
              </ul>
            </button>
          {:else}
            <button
              on:click={() => onSchemeSelect(scheme)}
              class="px-4 py-2 hover:bg-slate-600"
            >
              <ul class="flex">
                {#each scheme[count] as color}
                  <li>
                    <span
                      style="background-color: {color};"
                      class="block h-4 w-6"
                    />
                  </li>
                {/each}
              </ul>
            </button>
          {/if}
        {/each}
      </ul>
    {/if}
  </div>
  <button on:click={onSchemeReverse}><ReverseIcon /></button>
</div>

<style>
  .first-scheme:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
