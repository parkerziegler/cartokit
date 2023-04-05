<script lang="ts">
  import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';
  import ColorStopsSelect from '$lib/components/color/ColorStopsSelect.svelte';
  import OpacityInput from '$lib/components/color/OpacityInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { decimalToPercent } from '$lib/utils/color';
  import { DEFAULT_OPACITY } from '$lib/utils/constants';
  import PalettePicker from '$lib/components/color/PalettePicker.svelte';

  $: opacity = $selectedLayer
    ? decimalToPercent($selectedLayer.style.opacity)
    : decimalToPercent(DEFAULT_OPACITY);

  function onOpacityChange(opacity: number) {
    if ($selectedLayer && $map) {
      dispatchLayerUpdate({
        type: 'opacity',
        map: $map,
        layer: $selectedLayer,
        payload: {
          opacity
        }
      });
    }
  }
</script>

<div class="stack-h stack-h-md">
  <ColorScaleSelect />
  <ColorStopsSelect />
</div>
<div class="stack-h stack-h-xs items-center">
  <PalettePicker />
  <OpacityInput {opacity} {onOpacityChange} />
</div>
