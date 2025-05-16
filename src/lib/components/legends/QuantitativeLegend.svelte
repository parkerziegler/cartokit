<script lang="ts">
  import type { ConstantStroke, LayerType, QuantitativeFill } from '$lib/types';
  import { catalog } from '$lib/state/catalog.svelte';
  import { materializeQuantitativeColorScheme } from '$lib/utils/scheme';

  interface Props {
    fill: QuantitativeFill;
    stroke: ConstantStroke | undefined;
    layerId: string;
    layerType: LayerType;
  }

  let { fill, stroke, layerId, layerType }: Props = $props();
  let { min, max } = catalog.value[layerId][fill.attribute];

  let colors = $derived(
    materializeQuantitativeColorScheme(
      fill.scheme.id,
      fill.scheme.direction,
      fill.count
    )
  );
</script>

<div class="stack stack-xs text-white">
  <p class="font-semibold">{fill.attribute} ↓</p>
  <div class="stack-h stack-h-xs rounded-md bg-slate-900">
    <ul class="stack stack-xs mt-3">
      {#each colors as color (color)}
        <li class="stack stack-xs stack-h stack-h-xs">
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
    <ul class="stack stack-xs">
      {#each [min, ...fill.thresholds, max] as stop (stop)}
        <li class="stack-h stack-h-xs h-4 font-mono text-3xs">
          <span class="text-slate-400"> → </span>
          <span>{stop.toFixed(2)}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
