<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { error } from '$lib/state/error.svelte';
  import type { CartoKitLayer } from '$lib/types';

  interface Props {
    layer: CartoKitLayer;
  }

  let { layer }: Props = $props();

  let options = $derived(
    layer.source.type === 'vector'
      ? layer.source.sourceLayerIds.map((id) => ({
          value: id,
          label: id
        }))
      : []
  );

  let selected = $derived(
    layer.source.type === 'vector'
      ? layer.source.sourceLayerIds[layer.source.sourceLayerIndex]
      : ''
  );

  async function onSourceLayerChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (layer.source.type !== 'vector') return;

    const diff: CartoKitDiff = {
      type: 'source-layer',
      layerId: layer.id,
      payload: {
        sourceSourceLayerId:
          layer.source.sourceLayerIds[layer.source.sourceLayerIndex],
        targetSourceLayerId: event.currentTarget.value
      }
    };

    try {
      await applyDiff(diff);
    } catch (e) {
      error.set(
        e instanceof Error ? e.message : 'Failed to change source layer.'
      );
    }
  }
</script>

<Select
  {options}
  {selected}
  id="source-layer-select"
  onchange={onSourceLayerChange}
/>
