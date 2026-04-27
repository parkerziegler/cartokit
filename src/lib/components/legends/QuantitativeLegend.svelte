<script lang="ts">
  import ColorRamp from '$lib/components/channel/shared/ColorRamp.svelte';
  import { catalog } from '$lib/state/catalog.svelte';
  import type { ConstantStroke, LayerType, QuantitativeFill } from '$lib/types';
  import { materializeColorScheme } from '$lib/utils/color/scheme';

  interface Props {
    fill: QuantitativeFill;
    stroke: ConstantStroke;
    layerId: string;
    layerType: LayerType;
    visible: boolean;
  }

  let { fill, stroke, layerId, layerType, visible }: Props = $props();
  let { min, max } = $derived(catalog.value[layerId][fill.attribute]);

  let colors = $derived(
    fill.scale.type === 'Continuous'
      ? []
      : materializeColorScheme(
          fill.scale.scheme.id,
          fill.scale.scheme.direction,
          fill.scale.steps
        )
  );
</script>

{#if fill.scale.type === 'Continuous'}
  <div class={['flex flex-col gap-2', visible ? 'opacity-100' : 'opacity-75']}>
    <p class="font-semibold">{fill.attribute} →</p>
    <div class="flex flex-col gap-2">
      <ColorRamp
        ramp={fill.scale.interpolator.id}
        direction={fill.scale.interpolator.direction}
      />
      <div class="text-3xs flex justify-between font-mono">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  </div>
{:else}
  <div class={['flex flex-col gap-2', visible ? 'opacity-100' : 'opacity-75']}>
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
                  stroke={stroke.visible ? stroke.color : 'none'}
                  stroke-width={stroke.visible ? stroke.width : 0}
                  stroke-opacity={stroke.visible ? stroke.opacity : 0}
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
                  stroke={stroke.visible ? stroke.color : 'none'}
                  stroke-width={stroke.visible ? stroke.width : 0}
                  stroke-opacity={stroke.visible ? stroke.opacity : 0}
                />
              </svg>
            {/if}
          </li>
        {/each}
      </ul>
      <ul class="flex flex-col gap-2">
        {#each [min, ...fill.scale.thresholds, max] as stop (stop)}
          <li class="text-3xs flex h-4 gap-2 font-mono">
            <span class="text-slate-400"> → </span>
            <span>{stop.toFixed(2)}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
