<script lang="ts">
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import SizeControls from '$lib/components/size/SizeControls.svelte';
  import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitProportionalSymbolLayer;
</script>

<MenuItem title="Size">
  <SizeControls {layer} />
</MenuItem>
<MenuItem title="Fill">
  <FillPicker {layer} />
  <FillModifier {layer} slot="action" />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
