<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import { tooltip } from '$lib/attachments/tooltip';
  import TransformationEditor from '$lib/components/data/TransformationEditor.svelte';
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import type { Channel, VisualizationType } from '$lib/types';

  interface Props {
    selected: string;
    layerId: string;
    visualizationType: VisualizationType;
    geojson?: FeatureCollection;
    channel: Exclude<Channel, 'stroke'>;
  }

  let { selected, layerId, visualizationType, geojson, channel }: Props =
    $props();

  const target = document.getElementById('map') ?? document.body;
  let editor: TransformationEditor | undefined = $state();
  let trigger: HTMLButtonElement;
  let left = $state(0);
  let transformationEditorVisible = $state(false);

  let properties = $derived(
    Object.entries(catalog.value[layerId])
      .filter(([_, value]) => {
        if (visualizationType === 'Quantitative') {
          return value.type === 'number' && value.unique >= 9;
        } else if (visualizationType === 'Categorical') {
          return (
            value.type === 'string' ||
            value.type === 'boolean' ||
            (value.type === 'number' && value.unique < 9)
          );
        }
      })
      .map(([property]) => property)
  );

  let options = $derived(
    properties.map((attribute) => ({
      value: attribute,
      label: attribute
    }))
  );

  async function onAttributeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: `${channel}-attribute`,
      layerId,
      payload: {
        attribute: event.currentTarget.value
      }
    };

    await applyDiff(diff);
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
{#if transformationEditorVisible && geojson}
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
