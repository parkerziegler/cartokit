<script lang="ts">
  import maplibregl from 'maplibre-gl';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import LayerTypeSelect from '$lib/components/layer-types/LayerTypeSelect.svelte';
  import ChoroplethPropertiesPanel from '$lib/components/properties/ChoroplethPropertiesPanel.svelte';
  import DotDensityPropertiesPanel from '$lib/components/properties/DotDensityPropertiesPanel.svelte';
  import DownloadData from '$lib/components/properties/DownloadData.svelte';
  import HeatmapPropertiesPanel from '$lib/components/properties/HeatmapPropertiesPanel.svelte';
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

  interface Props {
    map: maplibregl.Map;
    layer: CartoKitLayer;
  }

  let { map, layer }: Props = $props();

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
  class={[
    'absolute top-4 right-4 z-10 max-h-[calc(100%-2rem)] w-80 overflow-auto transition-[max-height,translate] duration-[200ms,400ms] ease-out',
    {
      'max-h-[calc(100%-25.25rem)]': $layout.dataVisible,
      '-translate-x-[33.333333vw]': $layout.editorVisible
    }
  ]}
>
  <MenuTitle class="mr-4"
    >{layer.displayName}
    {#snippet action()}
      <button onclick={onPropertiesMenuClose}>
        <CloseIcon />
      </button>
    {/snippet}
    {#snippet subtitle()}
      <div class="flex gap-2">
        <ViewData />
        <DownloadData {layer} />
      </div>
    {/snippet}
  </MenuTitle>
  <MenuItem title="Layer Type">
    <LayerTypeSelect {layer} />
  </MenuItem>
  {#if layer.type === 'Choropleth'}
    <ChoroplethPropertiesPanel {layer} />
  {:else if layer.type === 'Dot Density'}
    <DotDensityPropertiesPanel {layer} />
  {:else if layer.type === 'Heatmap'}
    <HeatmapPropertiesPanel {layer} />
  {:else if layer.type === 'Line'}
    <LinePropertiesPanel {layer} />
  {:else if layer.type === 'Point'}
    <PointPropertiesPanel {layer} />
  {:else if layer.type === 'Polygon'}
    <PolygonPropertiesPanel {layer} />
  {:else if layer.type === 'Proportional Symbol'}
    <ProportionalSymbolPropertiesPanel {layer} />
  {/if}
</Menu>
