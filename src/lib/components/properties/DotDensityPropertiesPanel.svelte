<script lang="ts">
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import DotControls from '$lib/components/dots/DotControls.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitDotDensityLayer } from '$lib/types';

  interface Props {
    layer: CartoKitDotDensityLayer;
  }

  let { layer }: Props = $props();
</script>

<MenuItem title="Dots">
  <DotControls {layer} />
</MenuItem>
<MenuItem title="Fill">
  {#if layer.style.fill}
    <FillPicker layerId={layer.id} fill={layer.style.fill} />
    <OpacityInput layerId={layer.id} channel="fill" style={layer.style.fill} />
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
