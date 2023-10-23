<script lang="ts">
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import DotControls from '$lib/components/dots/DotControls.svelte';
  import type { CartoKitDotDensityLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitDotDensityLayer;
</script>

<MenuItem title="Dots">
  <DotControls {layer} />
</MenuItem>
<MenuItem title="Fill">
  <FillPicker {layer} />
  <FillModifier {layer} slot="action" />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
