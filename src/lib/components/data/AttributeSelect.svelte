<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import type { Channel } from '$lib/types';
  import type { AttributeKind } from '$lib/types/attribute';

  interface Props {
    selected: string;
    layerId: string;
    attributeKind: AttributeKind;
    channel: Exclude<Channel, 'stroke'>;
  }

  let { selected, layerId, attributeKind, channel }: Props = $props();

  let options = $derived(
    Object.entries(catalog.value[layerId].attributes).reduce<
      { value: string; label: string }[]
    >((acc, [attribute, entry]) => {
      if (attributeKind === entry.kind) {
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
