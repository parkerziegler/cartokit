<script lang="ts">
  import ClassificationMethodSelect from '$lib/components/classification/ClassificationMethodSelect.svelte';
  import ColorSchemeSelect from '$lib/components/color/ColorSchemeSelect.svelte';
  import ColorStepsSelect from '$lib/components/color/ColorStepsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import type { CartoKitChoroplethLayer } from '$lib/types';

  export let layer: CartoKitChoroplethLayer;
</script>

<div class="stack stack-2xs">
  <AttributeSelect {layer} selected={layer.style.fill.attribute} />
  <ClassificationMethodSelect {layer} />
  <ColorStepsSelect {layer} />
  <ColorSchemeSelect {layer} />
  <OpacityInput {layer} property="fill" />
</div>
