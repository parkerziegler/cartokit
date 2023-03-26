<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { COLOR_SCALES, type ColorScale } from '$lib/types/ColorScales';
  import { isChoroplethLayer } from '$lib/types/CartoKitLayer';

  const selected =
    $selectedLayer && isChoroplethLayer($selectedLayer)
      ? $selectedLayer.style.breaks.scale
      : COLOR_SCALES[0];
  const options = COLOR_SCALES.map((scale) => ({
    value: scale,
    label: scale
  }));

  function onChange(event: CustomEvent<{ value: ColorScale }>) {
    if ($map && $selectedLayer) {
      dispatchLayerUpdate({
        type: 'color-scale-type',
        map: $map,
        layer: $selectedLayer,
        payload: {
          scale: event.detail.value
        }
      });
    }
  }
</script>

<Select {options} {selected} on:change={onChange} title="Method" />
