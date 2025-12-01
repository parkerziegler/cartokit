<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import { tooltip } from '$lib/attachments/tooltip';
  import TransformationEditor from '$lib/components/data/TransformationEditor.svelte';
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
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
  let transformationEditorVisible = $state(false);

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

  function onAttributeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    // Convert channel-based attribute to specific diff type.
    const diffType = channel === 'fill' ? 'fill-attribute' : 'size-attribute';

    const diff: CartoKitDiff = {
      type: diffType,
      layerId,
      payload: {
        attribute: event.currentTarget.value
      }
    };

    applyDiff(diff);
  }

  function onClickComputedAttribute() {
    transformationEditorVisible = true;
    const propertiesMenu = document.getElementById('properties');

    if (propertiesMenu) {
      ({ left } = propertiesMenu.getBoundingClientRect());
    }
  }

  function onCloseEditor() {
    transformationEditorVisible = false;
  }

  function onClickOutsideEditor(event: MouseEvent) {
    if (!trigger.contains(event.target as Node)) {
      onCloseEditor();
    }
  }

  // When the editor opens, focus it.
  $effect(() => {
    if (editor) {
      editor.focus();
    }
  });
</script>

<div class="flex items-center gap-2">
  <Select
    {options}
    {selected}
    id="{channel}-attribute-select"
    title="Attribute"
    onchange={onAttributeChange}
    class="w-[80%] truncate"
  />
  <button
    bind:this={trigger}
    onclick={onClickComputedAttribute}
    data-testid="open-transformation-editor-button"
    {@attach tooltip({
      content: 'Open Transformation Editor'
    })}
  >
    <MoreIcon />
  </button>
</div>
{#if transformationEditorVisible}
  <Portal
    class="absolute top-4"
    {target}
    style="left: {left - 16 - 24 * 16}px;"
  >
    <TransformationEditor
      oncloseeditor={onCloseEditor}
      onclickoutsideeditor={onClickOutsideEditor}
      {layerId}
      {geojson}
      bind:this={editor}
    />
  </Portal>
{/if}
