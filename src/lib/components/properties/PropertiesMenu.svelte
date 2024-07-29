<script lang="ts">
  import cs from 'classnames';
  import maplibregl from 'maplibre-gl';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import LayerTypeSelect from '$lib/components/layer-types/LayerTypeSelect.svelte';
  import ChoroplethPropertiesPanel from '$lib/components/properties/ChoroplethPropertiesPanel.svelte';
  import DotDensityPropertiesPanel from '$lib/components/properties/DotDensityPropertiesPanel.svelte';
  import DownloadData from '$lib/components/properties/DownloadData.svelte';
  import LinePropertiesPanel from '$lib/components/properties/LinePropertiesPanel.svelte';
  import PointPropertiesPanel from '$lib/components/properties/PointPropertiesPanel.svelte';
  import PolygonPropertiesPanel from '$lib/components/properties/PolygonPropertiesPanel.svelte';
  import ProportionalSymbolPropertiesPanel from '$lib/components/properties/ProportionalSymbolPropertiesPanel.svelte';
  import ViewData from '$lib/components/properties/ViewData.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import MenuTitle from '$lib/components/shared/MenuTitle.svelte';
  import { layout } from '$lib/stores/layout';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import type { CartoKitLayer } from '$lib/types';

  export let map: maplibregl.Map;
  export let layer: CartoKitLayer;

  function onPropertiesMenuClose() {
    if ($selectedFeature) {
      map.removeFeatureState(
        { source: $selectedFeature.layer.id, id: $selectedFeature.id },
        'selected'
      );

      selectedFeature.set(null);
    }

    if ($layout.dataVisible) {
      layout.update((layout) => {
        layout.dataVisible = false;

        return layout;
      });
    }
  }
</script>

<Menu
  id="properties"
  class={cs('properties absolute right-4 top-4 z-10 w-80 overflow-auto', {
    'properties--y-compact': $layout.dataVisible,
    'properties--x-compact': $layout.editorVisible
  })}
>
  <MenuTitle class="mr-4"
    >{layer.displayName}
    <button on:click={onPropertiesMenuClose} slot="action">
      <CloseIcon />
    </button>
    <div class="stack-h stack-h-xs" slot="subtitle">
      <ViewData />
      <DownloadData {layer} />
    </div>
  </MenuTitle>
  <MenuItem title="Layer Type">
    <LayerTypeSelect {layer} />
  </MenuItem>
  {#if layer.type === 'Point'}
    <PointPropertiesPanel {layer} />
  {:else if layer.type === 'Proportional Symbol'}
    <ProportionalSymbolPropertiesPanel {layer} />
  {:else if layer.type === 'Dot Density'}
    <DotDensityPropertiesPanel {layer} />
  {:else if layer.type === 'Line'}
    <LinePropertiesPanel {layer} />
  {:else if layer.type === 'Polygon'}
    <PolygonPropertiesPanel {layer} />
  {:else if layer.type === 'Choropleth'}
    <ChoroplethPropertiesPanel {layer} />
  {/if}
</Menu>
