<script lang="ts">
  import ColorSchemeDropdown from '$lib/components/color/ColorSchemeDropdown.svelte';
  import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
  import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-xs">
  <AttributeSelect {layer} selected={layer.style.fill.attribute} />
  <ColorScaleSelect {layer} />
  <ColorStopsSelect {layer} />
  <ColorSchemeDropdown {layer} />
  <OpacityInput {layer} property="fill" />
</div>
