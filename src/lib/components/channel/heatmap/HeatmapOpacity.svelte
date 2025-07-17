<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import OpacityInput from '$lib/components/shared/OpacityInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

  function onOpacityChange(opacity: number) {
    const update = {
      type: 'heatmap-opacity' as const,
      layerId: layer.id,
      payload: { opacity }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-opacity',
        layerId: layer.id,
        payload: { opacity: layer.style.heatmap.opacity }
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="heatmap-opacity">Opacity</FieldLabel>
  <OpacityInput
    value={layer.style.heatmap.opacity}
    onchange={onOpacityChange}
  />
</div>
