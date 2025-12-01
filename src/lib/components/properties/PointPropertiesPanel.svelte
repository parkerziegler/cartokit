<script lang="ts">
  import ColorControls from '$lib/components/color/ColorControls.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import PointSize from '$lib/components/point/PointSize.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitPointLayer } from '$lib/types';

  interface Props {
    layer: CartoKitPointLayer;
  }

  let { layer }: Props = $props();
</script>

<MenuItem title="Size">
  <PointSize
    layerId={layer.id}
    size={layer.style.size}
    fieldId="point-size"
    label="Point Size"
  />
</MenuItem>
<MenuItem title="Fill">
  {#if layer.style.fill.visible}
    <ColorControls
      layerId={layer.id}
      layerType="Point"
      geojson={layer.data.geojson}
      fill={layer.style.fill}
    />
  {/if}
  {#snippet action()}
    <FillModifier layerId={layer.id} fill={layer.style.fill} />
  {/snippet}
</MenuItem>
<MenuItem title="Stroke">
  {#if layer.style.stroke.visible}
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
