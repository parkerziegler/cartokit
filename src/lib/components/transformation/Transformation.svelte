<script lang="ts">
  import type { FeatureCollection } from 'geojson';
  import { snakeCase, uniqueId } from 'lodash-es';
  import type { GeoJSONSource } from 'maplibre-gl';
  import { onMount, untrack } from 'svelte';
  import { slide } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import Key from '$lib/components/shared/Key.svelte';
  import LoadingIndicator from '$lib/components/shared/LoadingIndicator.svelte';
  import BufferParams from '$lib/components/transformation/BufferParams.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { contextMenu } from '$lib/state/context-menu.svelte';
  import { db } from '$lib/state/db.svelte';
  import { map } from '$lib/state/map.svelte';
  import { ir } from '$lib/stores/ir';
  import type { Transformation } from '$lib/types/transformation';
  import { DEFAULT_SIZE } from '$lib/utils/constants';
  import {
    generateTransformationExpression,
    quoteIdentifier,
    toFeatureCollection
  } from '$lib/utils/db';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    transformation: Transformation;
  }

  let { transformation: tx }: Props = $props();

  // Edits to transformation args are local to this instance until the
  // transformation is applied.
  // svelte-ignore state_referenced_locally
  let transformation = $state(tx);
  let editingParams = $state(false);
  let hovering = $state(false);
  let speculating = $state(false);
  let ref: HTMLLIElement;

  onMount(() => {
    const off = registerKeybinding(transformation.type.charAt(0), onClick, {
      requireMetaAndOption: true
    });

    return off;
  });

  // Incremented on each speculation, so stale results can be discarded.
  let generation = 0;

  async function speculate() {
    const { source } = $ir.layers[contextMenu.layerId];
    if (!db.value || source.type === 'pmtiles') {
      return;
    }

    // Set a timeout to display a spinner for speculation if we exceed 500ms on
    // processing time.
    const timeoutId = setTimeout(() => {
      speculating = true;
    }, 500);

    const gen = ++generation;

    // Cancel any in-flight speculation query. This only affects queries
    // started with conn.send, which only speculation uses.
    await db.value.conn.cancelSent();

    const { geometryColumn } = source.table;

    // Restrict speculation to features intersecting the current viewport.
    const [west, south, east, north] = map.value!.getBounds().toArray().flat();
    const viewport = `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north})`;

    const query = `SELECT ST_AsGeoJSON(${generateTransformationExpression(
      transformation,
      geometryColumn
    )}) AS geom
FROM ${contextMenu.layerId}
WHERE ST_Intersects(${quoteIdentifier(geometryColumn)}, ${viewport})`;

    // Use conn.send rather than conn.query: the worker executes a sent query
    // in slices, so a later cancelSent can interrupt it.
    let batches;
    try {
      const reader = await db.value.conn.send(query);
      batches = await reader.readAll();
    } catch {
      // The query was cancelled by a newer speculation.
      speculating = false;
      clearTimeout(timeoutId);

      return;
    }

    // Discard results superseded by a newer speculation or by ending preview.
    if (gen !== generation) {
      speculating = false;
      clearTimeout(timeoutId);

      return;
    }

    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: batches.flatMap((batch) => toFeatureCollection(batch).features)
    };

    const id = `${contextMenu.layerId}-speculate`;
    const speculatedSource = map.value!.getSource<GeoJSONSource>(id);

    // Parameter changes only need to update the existing speculated layer.
    if (speculatedSource) {
      speculatedSource.setData(geojson);

      speculating = false;
      clearTimeout(timeoutId);

      return;
    }

    const previewColor = $ir.basemap.mode === 'dark' ? '#ffffff' : '#000000';

    map.value!.addSource(id, {
      type: 'geojson',
      data: geojson,
      generateId: true
    });

    switch (transformation.type) {
      case 'Buffer':
        map.value!.addLayer({
          id,
          type: 'fill',
          source: id,
          paint: {
            'fill-color': previewColor,
            'fill-opacity': 0.25
          }
        });
        break;
      case 'Centroid':
        map.value!.addLayer({
          id,
          type: 'circle',
          source: id,
          paint: {
            'circle-color': previewColor,
            'circle-opacity': 0.5,
            'circle-radius': DEFAULT_SIZE
          }
        });
        break;
      case 'Envelope':
        map.value!.addLayer({
          id,
          type: 'line',
          source: id,
          paint: {
            'line-color': previewColor,
            'line-opacity': 0.5
          }
        });
        break;
    }

    speculating = false;
    clearTimeout(timeoutId);
  }

  function onMouseEnter() {
    hovering = true;
  }

  function onMouseLeave() {
    speculating = false;
    hovering = false;
  }

  async function onClick() {
    const parentLayerId = contextMenu.layerId;
    const displayName = `${$ir.layers[parentLayerId].displayName} (${transformation.type}s)`;

    // Reset state; this will trigger preview removal via the $effect below.
    hovering = false;
    editingParams = false;

    await applyDiff({
      type: 'add-layer',
      layerId: uniqueId(`${snakeCase(displayName)}__`),
      payload: {
        type: 'table',
        displayName,
        location: {
          type: 'table',
          parentLayerId,
          transformation: $state.snapshot(transformation)
        }
      }
    });

    // Close the context menu.
    contextMenu.layerId = '';
  }

  function onClickParams() {
    editingParams = !editingParams;
  }

  function removePreview(layerId: string) {
    // Ensure an in-flight speculation doesn't re-add the preview.
    generation++;

    const id = `${layerId}-speculate`;

    if (map.value?.getLayer(id)) {
      map.value.removeLayer(id);
    }

    if (map.value?.getSource(id)) {
      map.value.removeSource(id);
    }
  }

  // Re-run the live preview whenever args change while hovering.
  $effect(() => {
    $state.snapshot(transformation.args);

    if (hovering || (editingParams && ref.contains(document.activeElement))) {
      untrack(() => speculate());
    }
  });

  $effect(() => {
    if (!hovering && !editingParams) {
      removePreview(contextMenu.layerId);
    }
  });

  $effect(() => {
    const layerId = contextMenu.layerId;

    return () => removePreview(layerId);
  });
</script>

<li
  class="flex flex-col transition-colors hover:bg-slate-800"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  bind:this={ref}
>
  <div class="flex gap-1.5 rounded-sm px-2 py-1.5 text-white">
    <button class="flex flex-1 justify-between" onclick={onClick}
      ><span>{transformation.type}</span>
      <div class="flex items-center gap-1.5">
        {#if speculating}
          <LoadingIndicator variant="sm" />
        {/if}
        <div class="flex items-baseline gap-1 text-slate-400">
          <Key>⌥</Key><Key>⌘</Key><Key>{transformation.type.charAt(0)}</Key>
        </div>
      </div></button
    >
    {#if Object.keys(transformation.args).length > 0}
      <button
        {@attach tooltip({ content: 'Adjust Parameters' })}
        onclick={onClickParams}
      >
        <ChevronIcon height={10} width={10} rotate={editingParams ? 180 : 0} />
      </button>
    {/if}
  </div>
  {#if editingParams}
    <div transition:slide>
      {#if transformation.type === 'Buffer'}
        <BufferParams bind:args={transformation.args} />
      {/if}
    </div>
  {/if}
</li>
