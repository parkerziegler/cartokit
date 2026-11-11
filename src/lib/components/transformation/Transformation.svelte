<script lang="ts">
  import { snakeCase, uniqueId } from 'lodash-es';
  import type { GeoJSONSource } from 'maplibre-gl';
  import { onMount, untrack } from 'svelte';
  import { slide } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import Key from '$lib/components/shared/Key.svelte';
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

  onMount(() => {
    const off = registerKeybinding(transformation.type.charAt(0), onClick, {
      requireMetaAndOption: true
    });

    return off;
  });

  async function speculate() {
    const { source } = $ir.layers[contextMenu.layerId];
    if (!db.value || source.type === 'pmtiles') {
      return;
    }

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
    const geojson = toFeatureCollection(await db.value.conn.query(query));

    const id = `${contextMenu.layerId}-speculate`;
    const speculatedSource = map.value!.getSource<GeoJSONSource>(id);

    // Parameter changes only need to update the existing speculated layer.
    if (speculatedSource) {
      speculatedSource.setData(geojson);
      return;
    }

    map.value!.addSource(id, {
      type: 'geojson',
      data: geojson,
      generateId: true
    });

    // Derive the color for speculative layers based on the theme.
    const color = $ir.basemap.mode === 'dark' ? '#ffffff' : '#000000';

    switch (transformation.type) {
      case 'Buffer':
        map.value!.addLayer({
          id,
          type: 'fill',
          source: id,
          paint: {
            'fill-color': color,
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
            'circle-color': color,
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
            'line-color': color
          }
        });
        break;
    }
  }

  function onMouseEnter() {
    hovering = true;
  }

  function onMouseLeave() {
    hovering = false;
    const id = `${contextMenu.layerId}-speculate`;

    if (map.value?.getLayer(id)) {
      map.value.removeLayer(id);
    }

    if (map.value?.getSource(id)) {
      map.value.removeSource(id);
    }
  }

  async function onClick() {
    const parentLayerId = contextMenu.layerId;
    const displayName = `${$ir.layers[parentLayerId].displayName} (${transformation.type}s)`;

    // Close the context menu.
    contextMenu.layerId = '';

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
  }

  function onClickParams() {
    editingParams = true;
  }

  // Re-run the live preview whenever args change while hovering.
  $effect(() => {
    $state.snapshot(transformation.args);

    if (hovering) {
      untrack(() => speculate());
    }
  });
</script>

<li
  class="flex flex-col transition-colors hover:bg-slate-800"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <div class="flex gap-1.5 rounded-sm px-2 py-1.5 text-white">
    <button class="flex flex-1 justify-between" onclick={onClick}
      ><span>{transformation.type}</span>
      <div class="flex items-center gap-1.5">
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
        <ChevronIcon height={10} width={10} />
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
