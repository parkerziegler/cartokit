<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import type {
    CartoKitChoroplethLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types/CartoKitLayer';

  export let selected: string;
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
