<script lang="ts">
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitPolygonLayer } from '$lib/types';

  export let layer: CartoKitPolygonLayer;
</script>

<MenuItem title="Fill">
  {#if layer.style.fill}
    <FillPicker layerId={layer.id} fill={layer.style.fill} />
    <OpacityInput layerId={layer.id} channel="fill" style={layer.style.fill} />
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
