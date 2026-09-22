<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import type { Channel, VisualizationType } from '$lib/types';

  interface Props {
    selected: string;
    layerId: string;
    visualizationType: VisualizationType;
    channel: Exclude<Channel, 'stroke'>;
  }

  let { selected, layerId, visualizationType, channel }: Props = $props();

  let options = $derived(
    Object.entries(catalog.value[layerId]).reduce<
      { value: string; label: string }[]
    >((acc, [attribute, value]) => {
      const isQuantitative =
        visualizationType === 'Quantitative' &&
        value.type === 'number' &&
        value.unique >= 9;
      const isCategorical =
        visualizationType === 'Categorical' &&
        (value.type === 'string' ||
          value.type === 'boolean' ||
          (value.type === 'number' && value.unique < 9));

      if (isQuantitative || isCategorical) {
        acc.push({
          value: attribute,
          label: attribute
        });
      }

      return acc;
    }, [])
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
</script>

<Select
  {options}
  {selected}
  id="{channel}-attribute-select"
  title="Attribute"
  onchange={onAttributeChange}
  class="w-[80%] truncate"
/>
