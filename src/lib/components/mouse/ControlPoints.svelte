<script lang="ts">
  import {
    hideControlPoints,
    showControlPoints
  } from '#lib/interaction/drag.ts';
  import { feature } from '#lib/state/feature.svelte.ts';
  import { map } from '#lib/state/map.svelte.ts';
  import { ir } from '#lib/stores/ir.ts';

  const layerId = $derived(feature.value?.layerId);
  const featureId = $derived(feature.value?.id);

  const bufferDistance = $derived.by(() => {
    const source = layerId ? $ir.layers[layerId]?.source : undefined;

    return source?.type === 'table' &&
      source.location.transformation.type === 'Buffer'
      ? source.location.transformation.args.distance
      : null;
  });

  $effect(() => {
    if (
      !map.value ||
      !layerId ||
      typeof featureId !== 'number' ||
      bufferDistance === null
    ) {
      return;
    }

    const controller = new AbortController();
    showControlPoints({
      featureId,
      layerId,
      map: map.value,
      signal: controller.signal
    });

    return () => {
      controller.abort();
      hideControlPoints();
    };
  });
</script>
