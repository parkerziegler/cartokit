<script lang="ts">
  import AttributeEditor from '$lib/components/data/AttributeEditor.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
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

  let target = document.getElementById('map') ?? document.body;
  let propertiesMenu = document.getElementById('properties') ?? document.body;
  let ref: Select<string>;
  let dimensions: { top: number; left: number; right: number } = {
    top: 0,
    left: 0,
    right: 0
  };

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

  let attributeEditorVisible = false;

  function onClickComputedAttribute() {
    attributeEditorVisible = true;

    if (propertiesMenu) {
      const { top } = ref.getBoundingClientRect();
      const { left, right } = propertiesMenu.getBoundingClientRect();
      dimensions = {
        left,
        right,
        top
      };
    }
  }

  function onCloseComputedAttribute() {
    attributeEditorVisible = false;
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <Select
    {options}
    {selected}
    on:change={onChange}
    title="Attribute"
    bind:this={ref}
  />
  <button on:click={onClickComputedAttribute}><GearIcon /></button>
</div>
{#if attributeEditorVisible}
  <Portal
    class="absolute"
    {target}
    style="top: {dimensions.top}px; right: {dimensions.right -
      dimensions.left +
      32}px;"
  >
    <AttributeEditor onClose={onCloseComputedAttribute} />
  </Portal>
{/if}
