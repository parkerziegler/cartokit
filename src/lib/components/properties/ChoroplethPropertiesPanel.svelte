<script lang="ts">
  import ColorPalette from '$lib/components/color/ColorPalette.svelte';
  import StrokeModifier from '$lib/components/color/StrokeModifier.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  export let layer: CartoKitChoroplethLayer;
</script>

<MenuItem title="Fill">
  <ColorPalette {layer} />
</MenuItem>
<MenuItem title="Stroke">
  <StrokePicker {layer} />
  <StrokeModifier {layer} slot="action" />
</MenuItem>
