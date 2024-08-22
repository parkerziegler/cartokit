<script lang="ts">
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import StrokePicker from '$lib/components/color/StrokePicker.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type { CartoKitLineLayer } from '$lib/types';

  export let layer: CartoKitLineLayer;
</script>

<MenuItem title="Stroke">
  <StrokePicker layerId={layer.id} stroke={layer.style.stroke} />
  <OpacityInput
    layerId={layer.id}
    channel="stroke"
    style={layer.style.stroke}
  />
</MenuItem>
