<script lang="ts">
  import ColorSchemeDropdown from '$lib/components/color/ColorSchemeDropdown.svelte';
  import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
  import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
  import { decimalToPercent } from '$lib/utils/color';

  export let layer: CartoKitChoroplethLayer;

  $: opacity = decimalToPercent(layer.style.opacity);

  function onOpacityChange(opacity: number) {
    dispatchLayerUpdate({
      type: 'opacity',
      layer,
      payload: {
        opacity
      }
    });
  }
</script>

<div class="stack stack-xs">
  <ColorScaleSelect {layer} />
  <ColorStopsSelect {layer} />
  <ColorSchemeDropdown {layer} />
  <OpacityInput {opacity} {onOpacityChange} />
</div>
