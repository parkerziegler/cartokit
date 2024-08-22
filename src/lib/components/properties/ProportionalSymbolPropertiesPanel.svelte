<script lang="ts">
  import ColorControls from '$lib/components/color/ColorControls.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import SizeControls from '$lib/components/size/SizeControls.svelte';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';

  export let layer: CartoKitProportionalSymbolLayer;
</script>

<MenuItem title="Size">
  <SizeControls {layer} />
</MenuItem>
<MenuItem title="Fill">
  {#if layer.style.fill}
    <ColorControls
      layerId={layer.id}
      layerType="Proportional Symbol"
      geojson={layer.data.geojson}
      fill={layer.style.fill}
    />
  {/if}
  <FillModifier layerId={layer.id} fill={layer.style.fill} slot="action" />
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
