<script lang="ts">
  import ColorScaleMethodSelect from '$lib/components/color/ColorScaleMethodSelect.svelte';
  import ColorScaleStepsSelect from '$lib/components/color/ColorScaleStepsSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-2xs">
  <AttributeSelect {layer} selected={layer.style.fill.attribute} />
  <ColorScaleMethodSelect {layer} />
  <ColorScaleStepsSelect {layer} />
  <ColorSchemeSelect {layer} />
  <OpacityInput {layer} property="fill" />
</div>
