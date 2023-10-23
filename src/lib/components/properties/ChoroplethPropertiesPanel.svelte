<script lang="ts">
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import ColorPalette from '$lib/components/color/ColorPalette.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
</script>

<MenuItem title="Choropleth">
  <ColorPalette {layer} />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
