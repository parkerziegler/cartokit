<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedFeature } from '$lib/stores/selected-feature';
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

  $: properties = Object.keys($selectedFeature?.properties ?? {}).filter(
    (prop) => {
      switch (layer.type) {
        case 'Choropleth':
        case 'Proportional Symbol':
        case 'Dot Density':
          return isPropertyNumeric($selectedFeature?.properties[prop]);
      }
    }
  );
  $: options = properties.map((attribute) => ({
    value: attribute,
    label: attribute
  }));

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

<div class="stack-h stack-h-xs items-center">
  <Select {options} {selected} on:change={onChange} title="Attribute" />
</div>
