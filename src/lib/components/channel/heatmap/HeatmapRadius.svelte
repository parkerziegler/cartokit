<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

  function onHeatmapRadiusChange(value: number): void {
    const diff: CartoKitDiff = {
      type: 'heatmap-radius',
      layerId: layer.id,
      payload: { radius: value }
    };

    applyDiff(diff);
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
