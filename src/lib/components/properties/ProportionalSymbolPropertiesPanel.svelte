<script lang="ts">
  import ColorControls from '$lib/components/color/ColorControls.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import SizeControls from '$lib/components/size/SizeControls.svelte';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types';

  interface Props {
    layer: CartoKitProportionalSymbolLayer;
  }

  let { layer }: Props = $props();
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
  {#snippet action()}
    <FillModifier layerId={layer.id} fill={layer.style.fill} />
  {/snippet}
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
  {#snippet action()}
    <StrokeModifier layerId={layer.id} stroke={layer.style.stroke} />
  {/snippet}
</MenuItem>
