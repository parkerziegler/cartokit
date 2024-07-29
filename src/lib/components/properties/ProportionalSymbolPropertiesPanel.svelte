<script lang="ts">
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
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
    <FillPicker layerId={layer.id} fill={layer.style.fill} />
  {/if}
  <FillModifier layerId={layer.id} fill={layer.style.fill} slot="action" />
</MenuItem>
<MenuItem title="Stroke">
  {#if layer.style.stroke}
    <StrokePicker layerId={layer.id} stroke={layer.style.stroke} />
  {/if}
  <StrokeModifier
    layerId={layer.id}
    stroke={layer.style.stroke}
    slot="action"
  />
</MenuItem>
