<script lang="ts">
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import FillPicker from '$lib/components/color/FillPicker.svelte';
  import FillModifier from '$lib/components/color/FillModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import type { CartoKitPointLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitPointLayer;
</script>

<MenuItem title="Fill">
  <FillPicker {layer} />
  <FillModifier {layer} slot="action" />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
