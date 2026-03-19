<script lang="ts">
  import type {
    ConstantStroke,
    DiscreteQuantitativeFill,
    ContinuousQuantitativeFill,
    LayerType
  } from '$lib/types';
  import { catalog } from '$lib/state/catalog.svelte';
  import { materializeColorScheme } from '$lib/utils/color/scheme';
  import { materializeColorInterpolator } from '$lib/utils/color/interpolator';
  import { hexWithOpacity } from '$lib/utils/color';

  interface Props {
    fill: DiscreteQuantitativeFill | ContinuousQuantitativeFill;
    stroke: ConstantStroke;
    layerId: string;
    layerType: LayerType;
    visible: boolean;
  }

  let { fill, stroke, layerId, layerType, visible }: Props = $props();
  let { min, max } = $derived(catalog.value[layerId][fill.attribute]);

  let isDiscrete = $derived(fill.type === 'DiscreteQuantitative');
  let colors = $derived.by(() => {
    if (isDiscrete) {
      return materializeColorScheme((fill as DiscreteQuantitativeFill).scheme.id, (fill as DiscreteQuantitativeFill).scheme.direction, (fill as DiscreteQuantitativeFill).count);
    }
    return [];
  });

  let gradient = $derived.by(() => {
    if (!isDiscrete) {
      const contFill = fill as ContinuousQuantitativeFill;
      const colorInterpolator = materializeColorInterpolator(
        contFill.interpolator.id,
        contFill.interpolator.direction
      );
      return Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        return `${colorInterpolator(t)} ${t * 100}%`;
      }).join(', ');
    }
    return '';
  });

  let border = $derived(
    stroke.visible
      ? `${stroke.width}px solid ${hexWithOpacity(stroke.color, stroke.opacity)}`
      : '0 solid transparent'
  );
</script>

<div class={['flex flex-col gap-2', visible ? 'opacity-100' : 'opacity-75']}>
  <p class="font-semibold">{fill.attribute} ↓</p>
  {#if isDiscrete}
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
        {#each [min, ...(fill as DiscreteQuantitativeFill).thresholds, max] as stop (stop)}
          <li class="text-3xs flex h-4 gap-2 font-mono">
            <span class="text-slate-400"> → </span>
            <span>{stop.toFixed(2)}</span>
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <div class="flex w-32 flex-col gap-1">
      <div
        class="h-4 rounded-sm"
        style="background: linear-gradient(to right, {gradient}); border: {border}; opacity: {fill.opacity};"
      ></div>
      <div class="text-3xs flex justify-between font-mono">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  {/if}
</div>
