<script lang="ts">
  import ColorControls from '$lib/components/color/ColorControls.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  export let layer: CartoKitChoroplethLayer;
</script>

<MenuItem title="Fill">
  <ColorControls
    layerId={layer.id}
    layerType="Choropleth"
    geojson={layer.data.geojson}
    fill={layer.style.fill}
  />
</MenuItem>
<MenuItem title="Stroke">
  {#if layer.style.stroke}
    <StrokePicker layerId={layer.id} stroke={layer.style.stroke} />
    <OpacityInput
      layerId={layer.id}
      channel="stroke"
      style={layer.style.stroke}
    />
  {/if}
  <StrokeModifier
    layerId={layer.id}
    stroke={layer.style.stroke}
    slot="action"
  />
</MenuItem>
