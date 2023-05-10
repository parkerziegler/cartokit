<script lang="ts">
  import ColorSchemeDropdown from '$lib/components/color/ColorSchemeDropdown.svelte';
  import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
  import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import AttributeSelect from '$lib/components/data/AttributeSelect.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitChoroplethLayer;

  function onOpacityChange(opacity: number) {
    dispatchLayerUpdate({
      type: 'fill-opacity',
      layer,
      payload: {
        opacity
      }
    });
  }
</script>

<div class="stack stack-xs">
  <AttributeSelect {layer} selected={layer.style.fill.attribute} />
  <ColorScaleSelect {layer} />
  <ColorStopsSelect {layer} />
  <ColorSchemeDropdown {layer} />
  <OpacityInput opacity={layer.style.fill.opacity} {onOpacityChange} />
</div>
