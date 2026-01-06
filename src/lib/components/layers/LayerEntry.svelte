<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import MinusIcon from '$lib/components/icons/MinusIcon.svelte';
  import PointIcon from '$lib/components/icons/PointIcon.svelte';
  import PolygonIcon from '$lib/components/icons/PolygonIcon.svelte';
  import TooltipHiddenIcon from '$lib/components/icons/TooltipHiddenIcon.svelte';
  import TooltipIcon from '$lib/components/icons/TooltipIcon.svelte';
  import ProportionalSymbolIcon from '$lib/components/icons/ProportionalSymbolIcon.svelte';
  import ChoroplethLegend from '$lib/components/legends/ChoroplethLegend.svelte';
  import DotDensityLegend from '$lib/components/legends/DotDensityLegend.svelte';
  import HeatmapLegend from '$lib/components/legends/HeatmapLegend.svelte';
  import LineLegend from '$lib/components/legends/LineLegend.svelte';
  import PointLegend from '$lib/components/legends/PointLegend.svelte';
  import PolygonLegend from '$lib/components/legends/PolygonLegend.svelte';
  import ProportionalSymbolLegend from '$lib/components/legends/ProportionalSymbolLegend.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { feature } from '$lib/state/feature.svelte';
  import { map } from '$lib/state/map.svelte';
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let editingDisplayName = $state(false);
  // In this instance, we just want to capture the initial value of the display name.
  // svelte-ignore state_referenced_locally
  let lastCommittedDisplayName = $state(layer.displayName);
  let entry: HTMLDivElement;

  async function toggleLayerVisibility() {
    const diff: CartoKitDiff = {
      type: 'layer-visibility',
      layerId: layer.id,
      payload: {
        visible: !layer.layout.visible
      }
    };

    await applyDiff(diff);
  }

  async function toggleLayerTooltip() {
    const diff: CartoKitDiff = {
      type: 'layer-tooltip-visibility',
      layerId: layer.id,
      payload: {
        visible: !layer.layout.tooltip.visible
      }
    };

    await applyDiff(diff);
  }

  async function removeLayer() {
    const diff: CartoKitDiff = {
      type: 'remove-layer',
      layerId: layer.id,
      payload: {}
    };

    await applyDiff(diff);
  }

  function onLayerKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }
  ) {
    if (event.key === 'Enter') {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      }) as MouseEvent & {
        currentTarget: EventTarget & HTMLDivElement;
      };

      entry.dispatchEvent(event);
    }
  }

  function onDisplayNameDoubleClick() {
    editingDisplayName = true;
  }

  function onDisplayNameKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement }
  ) {
    if (event.key === 'Enter') {
      editingDisplayName = true;
    }
  }

  async function onDisplayNameInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'rename-layer',
      layerId: layer.id,
      payload: {
        displayName: event.currentTarget.value
      }
    };

    await applyDiff(diff);
  }

  async function onDisplayNameInputKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    if (event.key === 'Enter') {
      editingDisplayName = false;
      lastCommittedDisplayName = event.currentTarget.value;
    } else if (event.key === 'Escape') {
      editingDisplayName = false;

      const diff: CartoKitDiff = {
        type: 'rename-layer',
        layerId: layer.id,
        payload: {
          displayName: lastCommittedDisplayName
        }
      };

      await applyDiff(diff);
    }
  }

  function onDisplayNameInputBlur() {
    editingDisplayName = false;
    lastCommittedDisplayName = layer.displayName;
  }

  function onDisplayNameInputClickOutside() {
    editingDisplayName = false;
    lastCommittedDisplayName = layer.displayName;
  }

  function onLayerClick(
    event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }
  ) {
    // If the user clicked one of the buttons contained in the layer entry
    // (Layer Visibility, Layer Tooltip Visibility, or Remove Layer), or the
    // layer is hidden, do nothing.
    if (event.target instanceof HTMLButtonElement || !layer.layout.visible) {
      return;
    }

    const randomFeature = map.value!.queryRenderedFeatures({
      layers: [layer.id]
    })[0];

    // If we have a currently selected feature, deselect it.
    if (feature.value) {
      map.value!.setFeatureState(
        { source: feature.value.layer.id, id: feature.value.id },
        { selected: false }
      );
    }

    feature.value = randomFeature;

    map.value!.setFeatureState(
      { source: layer.id, id: randomFeature.id },
      { selected: true }
    );
  }
</script>

<li class="flex flex-col gap-2">
  <div
    class={[
      'relative flex items-center justify-between',
      layer.layout.visible ? 'display-name--visible' : 'display-name--hidden',
      feature.value?.layer.id === layer.id && 'display-name--selected'
    ]}
    onclick={onLayerClick}
    onkeydown={onLayerKeyDown}
    role="button"
    tabindex="0"
    data-testid="layer-entry"
    bind:this={entry}
  >
    <div class="flex items-center">
      <span class="shrink-0">
        {#if layer.type === 'Choropleth'}
          <ChoroplethIcon />
        {:else if layer.type === 'Dot Density'}
          <DotDensityIcon />
        {:else if layer.type === 'Heatmap'}
          <HeatmapIcon />
        {:else if layer.type === 'Line'}
          <LineIcon />
        {:else if layer.type === 'Point'}
          <PointIcon />
        {:else if layer.type === 'Polygon'}
          <PolygonIcon />
        {:else if layer.type === 'Proportional Symbol'}
          <ProportionalSymbolIcon />
        {/if}
      </span>
      {#if editingDisplayName}
        <TextInput
          oninput={onDisplayNameInput}
          onblur={onDisplayNameInputBlur}
          onkeydown={onDisplayNameInputKeyDown}
          value={layer.displayName}
          class="mx-2 w-40 truncate font-sans text-sm font-medium tracking-wider"
          onclickoutside={onDisplayNameInputClickOutside}
          selectTextOnRender={true}
        />
      {:else}
        <span
          class="mx-2 w-40 cursor-default truncate border border-transparent p-2 font-sans text-sm font-medium tracking-wider"
          ondblclick={onDisplayNameDoubleClick}
          onkeydown={onDisplayNameKeyDown}
          role="button"
          tabindex="0">{layer.displayName}</span
        >
      {/if}
    </div>
    <div class="flex items-center gap-1">
      <button
        {@attach tooltip({
          content: layer.layout.visible ? 'Hide Layer' : 'Show Layer'
        })}
        onclick={toggleLayerVisibility}
        class="flex h-7 w-7 items-center justify-center rounded-sm hover:bg-slate-500"
      >
        {#if layer.layout.visible}
          <LayerVisibleIcon />
        {:else}
          <LayerHiddenIcon />
        {/if}
      </button>
      <button
        {@attach tooltip({
          content: layer.layout.tooltip.visible
            ? 'Hide Layer Tooltip'
            : 'Show Layer Tooltip'
        })}
        onclick={toggleLayerTooltip}
        class="flex h-7 w-7 items-center justify-center rounded-sm hover:bg-slate-500"
      >
        {#if layer.layout.tooltip.visible}
          <TooltipIcon />
        {:else}
          <TooltipHiddenIcon />
        {/if}
      </button>
      <button
        {@attach tooltip({
          content: 'Remove Layer'
        })}
        onclick={removeLayer}
        class="flex h-7 w-7 items-center justify-center rounded-sm hover:bg-slate-500"
      >
        <MinusIcon />
      </button>
    </div>
  </div>
  {#if layer.type === 'Choropleth'}
    <ChoroplethLegend {layer} />
  {:else if layer.type === 'Dot Density'}
    <DotDensityLegend {layer} />
  {:else if layer.type === 'Heatmap'}
    <HeatmapLegend {layer} />
  {:else if layer.type === 'Line'}
    <LineLegend {layer} />
  {:else if layer.type === 'Point'}
    <PointLegend {layer} />
  {:else if layer.type === 'Polygon'}
    <PolygonLegend {layer} />
  {:else if layer.type === 'Proportional Symbol'}
    <ProportionalSymbolLegend {layer} />
  {/if}
</li>

<style lang="postcss">
  @reference 'tailwindcss';

  .display-name--visible:hover::after {
    @apply absolute -left-4 -z-10 h-full bg-slate-700;
    width: calc(100% + 2rem);
    content: '';
  }

  .display-name--hidden {
    @apply opacity-75;
  }

  .display-name--selected::after {
    @apply absolute -left-4 -z-10 h-full bg-slate-600;
    width: calc(100% + 2rem);
    content: '';
  }
</style>
