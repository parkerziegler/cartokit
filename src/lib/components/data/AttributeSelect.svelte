<script lang="ts">
  import AttributeEditor from '$lib/components/data/AttributeEditor.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
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

  const target = document.getElementById('map')!;
  let ref: Select<string>;
  let editor: AttributeEditor;
  let dimensions: { top: number; left: number; right: number } = {
    top: 0,
    left: 0,
    right: 0
  };

  $: properties = Object.keys(
    layer.data.geoJSON.features[0]?.properties ?? {}
  ).filter((prop) => {
    switch (layer.type) {
      case 'Choropleth':
      case 'Proportional Symbol':
      case 'Dot Density':
        return isPropertyNumeric(
          layer.data.geoJSON.features[0].properties?.[prop]
        );
    }
  });
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

    const propertiesMenu = document.getElementById('properties')!;
    const { top } = ref.getBoundingClientRect();
    const { left, right } = propertiesMenu.getBoundingClientRect();
    dimensions = {
      left,
      right,
      top
    };
  }

  function onCloseComputedAttribute() {
    attributeEditorVisible = false;
  }

  // When the editor opens, focus it.
  $: if (editor) {
    editor.focus();
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
    <AttributeEditor
      onClose={onCloseComputedAttribute}
      {layer}
      bind:this={editor}
    />
  </Portal>
{/if}
