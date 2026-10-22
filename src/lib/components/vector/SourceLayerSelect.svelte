<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { error } from '$lib/state/error.svelte';
  import type { CartoKitPMTilesSource } from '$lib/types';

  interface Props {
    layerId: string;
    source: CartoKitPMTilesSource;
  }

  let { layerId, source }: Props = $props();

  const options = $derived(
    source.vectorLayers.map(({ id }) => ({
      value: id,
      label: id
    }))
  );

  async function onSourceLayerChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    if (source.type !== 'pmtiles') return;

    const diff: CartoKitDiff = {
      type: 'source-layer',
      layerId,
      payload: {
        sourceSourceLayerId: source.sourceLayerId,
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
  selected={source.sourceLayerId}
  id="source-layer-select"
  onchange={onSourceLayerChange}
/>
