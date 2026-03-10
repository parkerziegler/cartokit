<script lang="ts">
  import DotValue from '$lib/components/channel/dot/DotValue.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import PointSize from '$lib/components/point/PointSize.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitDotDensityLayer } from '$lib/types';

  interface Props {
    layer: CartoKitDotDensityLayer;
  }

  let { layer }: Props = $props();
</script>

<MenuItem title="Dots">
  <AttributeSelect
    layerId={layer.id}
    visualizationType="DiscreteQuantitative"
    geojson={layer.data.geojson}
    selected={layer.style.dot.attribute}
    channel="dot"
  />
  <PointSize
    layerId={layer.id}
    size={layer.style.size}
    fieldId="dot-size"
    label="Dot Size"
  />
  <DotValue {layer} />
</MenuItem>
<MenuItem title="Fill">
  {#if layer.style.fill.visible}
    <FillPicker layerId={layer.id} fill={layer.style.fill} />
    <OpacityInput layerId={layer.id} channel="fill" style={layer.style.fill} />
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
