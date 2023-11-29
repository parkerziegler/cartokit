<script lang="ts">
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import type { CartoKitLineLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLineLayer;
</script>

<MenuItem title="Stroke">
  <StrokePicker {layer} />
</MenuItem>
