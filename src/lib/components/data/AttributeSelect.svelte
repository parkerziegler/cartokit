<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import TransformationEditor from '$lib/components/data/TransformationEditor.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type { Channel, VisualizationType } from '$lib/types';
  import {
    isPropertyCategorical,
    isPropertyQuantitative
  } from '$lib/utils/property';

  interface Props {
    selected: string;
    layerId: string;
    visualizationType: VisualizationType;
    geojson: FeatureCollection;
    channel: Channel;
  }

  let { selected, layerId, visualizationType, geojson, channel }: Props =
    $props();

  const target = document.getElementById('map') ?? document.body;
  let editor: TransformationEditor | undefined = $state();
  let trigger: HTMLButtonElement;
  let left = $state(0);
  let attributeEditorVisible = $state(false);

  let properties = $derived(
    Object.keys(geojson.features[0]?.properties ?? {}).filter((prop) =>
      visualizationType === 'Quantitative'
        ? isPropertyQuantitative(geojson.features[0].properties?.[prop])
        : isPropertyCategorical(geojson.features[0].properties?.[prop])
    )
  );
  let options = $derived(
    properties.map((attribute) => ({
      value: attribute,
      label: attribute
    }))
  );

  function onChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    dispatchLayerUpdate({
      type: 'attribute',
      layerId,
      payload: {
        attribute: event.currentTarget.value,
        channel
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
  $effect(() => {
    if (editor) {
      editor.focus();
    }
  });
</script>

<div class="stack-h stack-h-xs items-center">
  <Select
    {options}
    {selected}
    id="{channel}-attribute-select"
    title="Attribute"
    {onChange}
    class="w-[80%] truncate"
  />
  <button
    bind:this={trigger}
    onclick={onClickComputedAttribute}
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
      {layerId}
      {geojson}
      bind:this={editor}
    />
  </Portal>
{/if}
