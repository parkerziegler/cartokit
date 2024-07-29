<script lang="ts">
  import TransformationEditor from '$lib/components/data/TransformationEditor.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CartoKitChoroplethLayer,
    CartoKitProportionalSymbolLayer,
    CartoKitDotDensityLayer
  } from '$lib/types';
  import { isPropertyNumeric } from '$lib/utils/property';

  export let selected: string;
  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  const target = document.getElementById('map') ?? document.body;
  let editor: TransformationEditor;
  let trigger: HTMLButtonElement;
  let left = 0;
  let attributeEditorVisible = false;

  $: properties = Object.keys(
    layer.data.geojson.features[0]?.properties ?? {}
  ).filter((prop) => {
    switch (layer.type) {
      case 'Choropleth':
      case 'Proportional Symbol':
      case 'Dot Density':
        return isPropertyNumeric(
          layer.data.geojson.features[0].properties?.[prop]
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

  function onClickComputedAttribute() {
    attributeEditorVisible = true;
    const propertiesMenu = document.getElementById('properties');

    if (propertiesMenu) {
      ({ left } = propertiesMenu.getBoundingClientRect());
    }
  }

  function onCloseComputedAttribute() {
    attributeEditorVisible = false;
  }

  function onClickOutside(event: CustomEvent<MouseEvent>) {
    if (!trigger.contains(event.detail.target as Node)) {
      onCloseComputedAttribute();
    }
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
    id="attribute-select"
    title="Attribute"
    on:change={onChange}
  />
  <button
    bind:this={trigger}
    on:click={onClickComputedAttribute}
    data-testid="open-transformation-editor-button"><GearIcon /></button
  >
</div>
{#if attributeEditorVisible}
  <Portal
    class="absolute top-4"
    {target}
    style="left: {left - 16 - 24 * 16}px;"
  >
    <TransformationEditor
      onClose={onCloseComputedAttribute}
      {onClickOutside}
      {layer}
      bind:this={editor}
    />
  </Portal>
{/if}
