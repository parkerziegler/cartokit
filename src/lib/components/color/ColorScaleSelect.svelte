<script lang="ts">
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { COLOR_SCALES, type ColorScale } from '$lib/types/color';
  import type { CartoKitChoroplethLayer } from '$lib/types/CartoKitLayer';
  import ManualBreaks from './ManualBreaks.svelte';

  export let layer: CartoKitChoroplethLayer;

  $: selected = layer.style.breaks.scale;
  const options = COLOR_SCALES.map((scale) => ({
    value: scale,
    label: scale
  }));

  function onChange(event: CustomEvent<{ value: ColorScale }>) {
    if ($map) {
      dispatchLayerUpdate({
        type: 'color-scale',
        map: $map,
        layer,
        payload: {
          scale: event.detail.value
        }
      });
    }
  }
</script>

<Select {options} {selected} on:change={onChange} title="Method" />
{#if selected === 'Manual'}
  <Portal class="absolute right-96 top-48">
    <ManualBreaks {layer} />
  </Portal>
{/if}
