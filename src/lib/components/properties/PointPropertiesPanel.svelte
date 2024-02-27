<script lang="ts">
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import PointSize from '$lib/components/point/PointSize.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitPointLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitPointLayer;
</script>

<MenuItem title="Size">
  <PointSize {layer} />
</MenuItem>
<MenuItem title="Fill">
  <FillPicker {layer} />
  <FillModifier {layer} slot="action" />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
