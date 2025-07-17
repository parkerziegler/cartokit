<script lang="ts">
  import type { ConstantStroke, LayerType, QuantitativeFill } from '$lib/types';
  import { catalog } from '$lib/state/catalog.svelte';
  import { materializeColorScheme } from '$lib/utils/color/scheme';

  interface Props {
    fill: QuantitativeFill;
    stroke: ConstantStroke | undefined;
    layerId: string;
    layerType: LayerType;
  }

  let { fill, stroke, layerId, layerType }: Props = $props();
  let { min, max } = $derived(catalog.value[layerId][fill.attribute]);

  let colors = $derived(
    materializeColorScheme(fill.scheme.id, fill.scheme.direction, fill.count)
  );
</script>

<div class="flex flex-col gap-2 text-white">
  <p class="font-semibold">{fill.attribute} ↓</p>
  <div class="flex gap-2 rounded-md bg-slate-900">
    <ul class="mt-3 flex flex-col gap-2">
      {#each colors as color (color)}
        <li>
          {#if layerType === 'Choropleth'}
            <svg viewBox="0 0 32 16" width="32" height="16">
              <rect
                x="0"
                y="0"
                width="32"
                height="16"
                fill={color}
                fill-opacity={fill.opacity}
                stroke={stroke?.color ?? 'none'}
                stroke-width={stroke?.width ?? '0'}
                stroke-opacity={stroke?.opacity ?? '0'}
              />
            </svg>
          {:else if layerType === 'Proportional Symbol' || layerType === 'Point'}
            <svg viewBox="0 0 16 16" width="16" height="16">
              <circle
                r="7"
                cx="8"
                cy="8"
                fill={color}
                fill-opacity={fill.opacity}
                stroke={stroke?.color ?? 'none'}
                stroke-width={stroke?.width ?? '0'}
                stroke-opacity={stroke?.opacity ?? '0'}
              />
            </svg>
          {/if}
        </li>
      {/each}
    </ul>
    <ul class="flex flex-col gap-2">
      {#each [min, ...fill.thresholds, max] as stop (stop)}
        <li class="text-3xs flex h-4 gap-2 font-mono">
          <span class="text-slate-400"> → </span>
          <span>{stop.toFixed(2)}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
