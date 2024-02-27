<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitChoroplethLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';
  import { isPropertyNumeric } from '$lib/utils/property';

  export let selected: string;
  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  $: properties = Object.keys(
    layer.data.geoJSON.features[0]?.properties ?? {}
  ).filter((prop) =>
    isPropertyNumeric(layer.data.geoJSON.features[0].properties?.[prop])
  );
  $: options = properties.map((attribute) => ({
    value: attribute,
    label: attribute
  }));

  const onChange = (event: CustomEvent<{ value: string }>) => {
    const attribute = event.detail.value;
    dispatchLayerUpdate({
      type: 'attribute',
      layer,
      payload: {
        attribute
      }
    });
  };
</script>

<div class="stack-h stack-h-xs items-center">
  <Select {options} {selected} on:change={onChange} title="Attribute" />
</div>
