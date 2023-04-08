<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import type {
    CartoKitChoroplethLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';
  import { selectNumericAttribute } from '$lib/utils/geojson';

  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  $: options = Object.keys($selectedFeature?.properties ?? {}).map(
    (attribute) => ({
      value: attribute,
      label: attribute
    })
  );
  $: selected =
    layer.attribute || selectNumericAttribute(layer.data.geoJSON.features);

  function onChange(event: CustomEvent<{ value: string }>) {
    const attribute = event.detail.value;
    dispatchLayerUpdate({
      type: 'attribute',
      layer,
      payload: {
        attribute
      }
    });
  }
</script>

<Select {options} {selected} on:change={onChange} />
