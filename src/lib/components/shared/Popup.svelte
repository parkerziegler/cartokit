<script lang="ts">
  import {
    computePosition,
    offset,
    autoUpdate,
    flip,
    shift
  } from '@floating-ui/dom';
  import type { GeoJsonProperties } from 'geojson';
  import { orderBy } from 'lodash-es';
  import { slide } from 'svelte/transition';

  import { popup } from '$lib/state/popup.svelte';
  import { ir } from '$lib/stores/ir';

  let popupRef: HTMLDivElement;
  let layerId = $derived(identifyTopmostVisibleInteractableLayer());
  let displayName = $derived(layerId ? popup[layerId]?.displayName : '');
  let properties = $derived<GeoJsonProperties>(
    layerId ? (popup[layerId]?.properties ?? {}) : {}
  );

  function identifyTopmostVisibleInteractableLayer(): string | undefined {
    const interactableLayers = Object.values($ir.layers).filter(
      (layer) =>
        layer.layout.visibility === 'visible' && layer.layout.tooltip.visible
    );
    const orderedLayers = orderBy(interactableLayers, 'layout.z', 'desc');

    for (const layer of orderedLayers) {
      if (popup[layer.id]?.open) {
        return layer.id;
      }
    }

    return undefined;
  }

  $effect(() => {
    const cursorRef = document.getElementById('cursor')!;

    const cleanup = autoUpdate(
      cursorRef,
      popupRef,
      () =>
        computePosition(cursorRef, popupRef, {
          placement: 'top',
          middleware: [offset(6), flip(), shift({ padding: 8 })]
        }).then(({ x, y }) => {
          Object.assign(popupRef.style, {
            left: `${x}px`,
            top: `${y}px`
          });
        }),
      {
        animationFrame: true
      }
    );
    return cleanup;
  });
</script>

<div
  class={[
    'absolute flex max-w-64 flex-col gap-2 rounded bg-slate-900 pt-2 pb-1 text-white shadow-lg',
    { hidden: !layerId || !popup[layerId]?.open }
  ]}
  bind:this={popupRef}
  transition:slide={{ axis: 'y' }}
>
  <p class="px-2 text-sm text-slate-300 uppercase">
    {displayName}
  </p>
  <table class="w-fit table-fixed border-collapse">
    <colgroup>
      <col />
      <col />
    </colgroup>
    <tbody>
      {#each Object.entries(properties ?? {}) as [key, value]}
        <tr class="border-b border-slate-600 last:border-b-0">
          <td
            class="overflow-hidden px-2 py-1 font-mono text-xs text-ellipsis text-slate-400"
            >{key}</td
          >
          <td
            class="overflow-hidden px-2 py-1 text-xs text-ellipsis whitespace-nowrap text-white"
            >{value}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
