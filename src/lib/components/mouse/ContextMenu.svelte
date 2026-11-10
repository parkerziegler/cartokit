<script lang="ts">
  import {
    computePosition,
    flip,
    offset,
    shift,
    type VirtualElement
  } from '@floating-ui/dom';

  import Transformation from '$lib/components/transformation/Transformation.svelte';
  import { catalog } from '$lib/state/catalog.svelte';
  import { contextMenu } from '$lib/state/context-menu.svelte';
  import { map } from '$lib/state/map.svelte';
  import type { Transformation as ITransformation } from '$lib/types/transformation';
  import { getDefaultBufferDistanceByZoom } from '$lib/utils/transformation';

  let contextMenuRef: HTMLDivElement;
  let availableTransformations = $derived.by((): ITransformation[] => {
    const layer = catalog.value[contextMenu.layerId];
    if (!layer || layer.type === 'pmtiles') {
      return [];
    }

    switch (layer.geometryType) {
      case 'Point':
      case 'MultiPoint':
        return [
          {
            type: 'Buffer',
            params: {
              distance: getDefaultBufferDistanceByZoom(map.value!.getZoom())
            }
          }
        ];
      case 'LineString':
      case 'MultiLineString':
      case 'Polygon':
      case 'MultiPolygon':
        return [
          {
            type: 'Buffer',
            params: {
              distance: getDefaultBufferDistanceByZoom(map.value!.getZoom())
            }
          },
          {
            type: 'Centroid',
            params: {}
          },
          {
            type: 'Envelope',
            params: {}
          }
        ];
      case 'GeometryCollection':
        return [];
    }
  });

  $effect(() => {
    if (availableTransformations.length > 0) {
      const { x: anchorX, y: anchorY } = contextMenu;
      const anchor: VirtualElement = {
        getBoundingClientRect: () => ({
          x: anchorX,
          y: anchorY,
          top: anchorY,
          left: anchorX,
          bottom: anchorY,
          right: anchorX,
          width: 0,
          height: 0
        })
      };

      computePosition(anchor, contextMenuRef, {
        placement: 'bottom',
        middleware: [offset(10), flip(), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        Object.assign(contextMenuRef.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });
    }
  });
</script>

<div
  class={[
    'absolute flex w-60 flex-col gap-1.5 overflow-clip rounded bg-slate-900 px-2 py-1.5 text-xs shadow-lg',
    { hidden: !contextMenu.layerId }
  ]}
  bind:this={contextMenuRef}
  data-testid="context-menu"
>
  <p class="px-2 py-1.5 text-xs tracking-wider text-slate-300 uppercase">
    Analysis
  </p>
  <span class="h-px w-full bg-slate-600"></span>
  <ul class="flex flex-col">
    {#each availableTransformations as transformation (transformation.type)}
      <Transformation {transformation} />
    {/each}
  </ul>
</div>
