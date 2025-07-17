<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

  function onHeatmapRadiusChange(value: number): void {
    const update = {
      type: 'heatmap-radius' as const,
      layerId: layer.id,
      payload: { radius: value }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-radius',
        layerId: layer.id,
        payload: { radius: layer.style.heatmap.radius }
      }
    });

    dispatchLayerUpdate(update);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="heatmap-radius">Radius</FieldLabel>
  <NumberInput
    id="heatmap-radius"
    min={1}
    value={layer.style.heatmap.radius}
    onchange={onHeatmapRadiusChange}
    class="w-8"
  />
</div>
