<script lang="ts">
  import ColorScaleMethodSelect from '$lib/components/color/ColorScaleMethodSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-xs">
  <AttributeSelect {layer} selected={layer.style.fill.attribute} />
  <ColorScaleMethodSelect {layer} />
  <ColorStopsSelect {layer} />
  <ColorSchemeSelect {layer} />
  <OpacityInput {layer} property="fill" />
</div>
