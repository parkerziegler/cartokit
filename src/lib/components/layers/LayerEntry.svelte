<script lang="ts">
  import { tooltip } from '$lib/attachments/tooltip';
  import ChoroplethIcon from '$lib/components/icons/ChoroplethIcon.svelte';
  import DotDensityIcon from '$lib/components/icons/DotDensityIcon.svelte';
  import LayerHiddenIcon from '$lib/components/icons/LayerHiddenIcon.svelte';
  import LayerVisibleIcon from '$lib/components/icons/LayerVisibleIcon.svelte';
  import LineIcon from '$lib/components/icons/LineIcon.svelte';
  import HeatmapIcon from '$lib/components/icons/HeatmapIcon.svelte';
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
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitLayer } from '$lib/types';
  import { map } from '$lib/stores/map';
  import { selectedFeature } from '$lib/stores/selected-feature';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let editingDisplayName = $state(false);
  let lastCommittedDisplayName = $state(layer.displayName);

  function toggleLayerVisibility() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'layer-visibility',
      payload: {
        visibility: layer.layout.visibility === 'visible' ? 'hidden' : 'visible'
      }
    });
  }

  function toggleLayerTooltip() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'layer-tooltip-visibility',
      payload: {
        visible: !layer.layout.tooltip.visible
      }
    });
  }

  function removeLayer() {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'remove-layer',
      payload: {}
    });
  }

  function onLayerKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }
  ) {
    if (event.key === 'Enter') {
      onLayerClick();
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

  function onDisplayNameInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    dispatchLayerUpdate({
      layerId: layer.id,
      type: 'rename-layer',
      payload: {
        displayName: event.currentTarget.value
      }
    });
  }

  function onDisplayNameInputKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    if (event.key === 'Enter') {
      editingDisplayName = false;
      lastCommittedDisplayName = event.currentTarget.value;
    } else if (event.key === 'Escape') {
      editingDisplayName = false;

      dispatchLayerUpdate({
        layerId: layer.id,
        type: 'rename-layer',
        payload: {
          displayName: lastCommittedDisplayName
        }
      });
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

  function onLayerClick() {
    const randomFeature = $map.queryRenderedFeatures({
      layers: [layer.id]
    })[0];

    // If we have a currently selected feature, deselect it.
    if ($selectedFeature) {
      $map.setFeatureState(
        { source: $selectedFeature.layer.id, id: $selectedFeature.id },
        { selected: false }
      );
    }

    selectedFeature.set(randomFeature);

    $map.setFeatureState(
      { source: layer.id, id: randomFeature.id },
      { selected: true }
    );
  }
</script>

<li class="flex flex-col gap-2">
  <div
    class={[
      'relative flex items-center justify-between',
      $selectedFeature?.layer.id === layer.id
        ? 'display-name--selected'
        : 'display-name'
    ]}
    onclick={onLayerClick}
    onkeydown={onLayerKeyDown}
    role="button"
    tabindex="0"
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
    <div class="flex items-center gap-2">
      <button
        onclick={toggleLayerVisibility}
        {@attach tooltip({
          content:
            layer.layout.visibility === 'visible' ? 'Hide Layer' : 'Show Layer'
        })}
      >
        {#if layer.layout.visibility === 'visible'}
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

  .display-name:hover::after {
    @apply absolute -left-4 -z-10 h-full bg-slate-700;
    width: calc(100% + 2rem);
    content: '';
  }

  .display-name--selected::after {
    @apply absolute -left-4 -z-10 h-full bg-slate-600;
    width: calc(100% + 2rem);
    content: '';
  }
</style>
