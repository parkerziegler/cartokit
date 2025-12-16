<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import OpacityInput from '$lib/components/channel/shared/OpacityInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitHeatmapLayer } from '$lib/types';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

  async function onOpacityChange(opacity: number) {
    const diff: CartoKitDiff = {
      type: 'heatmap-opacity',
      layerId: layer.id,
      payload: { opacity }
    };

    await applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel fieldId="heatmap-opacity">Opacity</FieldLabel>
  <OpacityInput
    id="heatmap-opacity"
    value={layer.style.heatmap.opacity}
    onchange={onOpacityChange}
  />
</div>
