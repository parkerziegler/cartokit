<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { snakeCase, uniqueId } from 'lodash-es';
  import type { GeoJSONSource } from 'maplibre-gl';
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import Key from '$lib/components/shared/Key.svelte';
  import BufferParams from '$lib/components/transformation/BufferParams.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { catalog } from '$lib/state/catalog.svelte';
  import { contextMenu } from '$lib/state/context-menu.svelte';
  import { db } from '$lib/state/db.svelte';
  import { map } from '$lib/state/map.svelte';
  import { ir } from '$lib/stores/ir';
  import type {
    Transformation,
    TransformationsByType
  } from '$lib/types/transformation';
  import { DEFAULT_SIZE } from '$lib/utils/constants';
  import {
    generateTransformationExpression,
    GEOMETRY_TYPES_TO_TRANSFORMATION_TYPES,
    quoteIdentifier,
    toFeatureCollection
  } from '$lib/utils/db';
  import { registerKeybinding } from '$lib/utils/keybinding';

  const SPECULATION_DEBOUNCE_MS = 200;

  // Web Mercator meters per pixel at zoom 0 for MapLibre's 512px tiles.
  const METERS_PER_PIXEL_Z0 = (2 * Math.PI * 6378137) / 512;
  const BUFFER_DEFAULT_PIXELS = 20;

  /**
   * Choose a buffer distance that renders as roughly BUFFER_DEFAULT_PIXELS on
   * screen at the given zoom, rounded to a 1, 2, or 5 × 10ⁿ value. Buffers are
   * computed in EPSG:3857, so meters map to pixels independent of latitude.
   */
  function defaultBufferDistance(zoom: number): number {
    const target = (BUFFER_DEFAULT_PIXELS * METERS_PER_PIXEL_Z0) / 2 ** zoom;
    const magnitude = 10 ** Math.floor(Math.log10(target));
    const nice = [1, 2, 5, 10].find((n) => n * magnitude >= target) ?? 10;

    return nice * magnitude;
  }

  let contextMenuRef: HTMLDivElement;
  let availableTransformations = $derived.by(() => {
    const layer = catalog.value[contextMenu.layerId];
    if (!layer || layer.type === 'pmtiles') {
      return [];
    }

    return GEOMETRY_TYPES_TO_TRANSFORMATION_TYPES.get(layer.geometryType) ?? [];
  });
  let transformations = $state<TransformationsByType>({
    Buffer: { type: 'Buffer', params: { distance: 1000 } },
    Centroid: { type: 'Centroid', params: {} },
    Envelope: { type: 'Envelope', params: {} }
  });
  let hoveredType = $state<Transformation['type'] | null>(null);
  let parameterizedType = $state<Transformation['type'] | null>(null);

  // Keep the preview up while a transformation's parameters are being edited,
  // when the mouse is no longer hovering its button.
  let speculatedType = $derived(hoveredType ?? parameterizedType);

  $effect(() => {
    const cursorRef = document.getElementById('cursor')!;
    let offs: (() => void)[] = [];

    if (availableTransformations.length > 0) {
      computePosition(cursorRef, contextMenuRef, {
        placement: 'bottom',
        middleware: [offset(6), flip(), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        Object.assign(contextMenuRef.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });

      offs = availableTransformations.map((type) =>
        registerKeybinding(type.charAt(0), onClickTransformation(type), {
          requireMetaAndOption: true
        })
      );
    }

    return () => {
      offs.forEach((off) => off());
    };
  });

  // Reset the buffer distance each time the menu opens so the preview is
  // visible at the current zoom.
  $effect(() => {
    if (contextMenu.layerId && map.value) {
      transformations.Buffer.params.distance = defaultBufferDistance(
        map.value.getZoom()
      );
    }
  });

  // Remove the speculated layer when the speculated type changes or the menu
  // closes, but not when only parameters change, so the preview doesn't flicker.
  $effect(() => {
    const layerId = contextMenu.layerId;

    if (!speculatedType) {
      return;
    }

    return () => {
      removeSpeculation(layerId);
    };
  });

  // Rerun the speculation query after the speculated type or its parameters
  // settle, discarding the results of any query that has been superseded.
  $effect(() => {
    if (!speculatedType) {
      return;
    }

    const layerId = contextMenu.layerId;
    const transformation = $state.snapshot(transformations[speculatedType]);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      speculate(layerId, transformation, controller.signal);
    }, SPECULATION_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  });

  function onClickTransformation(type: Transformation['type']) {
    return async function handleClick() {
      const parentLayerId = contextMenu.layerId;
      const displayName = `${$ir.layers[parentLayerId].displayName} (${type}s)`;
      const transformation = $state.snapshot(transformations[type]);

      // Close the menu and wait for its teardown to remove the speculated layer
      // before adding the derived layer.
      contextMenu.layerId = '';
      await tick();

      await applyDiff({
        type: 'add-layer',
        layerId: uniqueId(`${snakeCase(displayName)}__`),
        payload: {
          type: 'table',
          displayName,
          location: {
            type: 'table',
            parentLayerId,
            transformation
          }
        }
      });
    };
  }

  function onMouseEnter(type: Transformation['type']) {
    return function handleMouseEnter() {
      hoveredType = type;
    };
  }

  function onMouseLeave() {
    hoveredType = null;
  }

  async function speculate(
    layerId: string,
    transformation: Transformation,
    signal: AbortSignal
  ) {
    const { source } = $ir.layers[layerId];

    if (!db.value || source.type === 'pmtiles') {
      return;
    }

    const { geometryColumn } = source.table;
    const transformed = generateTransformationExpression(
      transformation,
      geometryColumn
    );

    // Restrict speculation to features intersecting the current viewport.
    const [west, south, east, north] = map.value!.getBounds().toArray().flat();
    const viewport = `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north})`;

    const query = `SELECT ST_AsGeoJSON(${transformed}) AS geom FROM ${layerId} WHERE ST_Intersects(${quoteIdentifier(geometryColumn)}, ${viewport})`;
    const geojson = toFeatureCollection(await db.value.conn.query(query));

    // Skip drawing if the speculation was superseded during the query.
    if (signal.aborted) {
      return;
    }

    const id = `${layerId}-speculate`;
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

  function removeSpeculation(layerId: string) {
    const id = `${layerId}-speculate`;

    if (map.value!.getLayer(id)) {
      map.value!.removeLayer(id);
    }

    if (map.value!.getSource(id)) {
      map.value!.removeSource(id);
    }
  }

  function onBufferDistanceChange(distance: number) {
    transformations.Buffer.params.distance = distance;
  }

  function onClickTransformationParams(type: Transformation['type']) {
    return function handleClickTransformationParams() {
      parameterizedType = parameterizedType === type ? null : type;
    };
  }
</script>

<div
  class={[
    'absolute flex w-60 flex-col gap-1.5 overflow-clip rounded bg-slate-900 px-2 py-1.5 text-xs shadow-lg',
    { hidden: !contextMenu.layerId }
  ]}
  bind:this={contextMenuRef}
>
  <p class="px-2 py-1.5 text-xs tracking-wider text-slate-300 uppercase">
    Analysis
  </p>
  <span class="h-px w-full bg-slate-600"></span>
  <ul class="flex flex-col">
    {#each availableTransformations as type (type)}
      <li
        class="flex flex-col transition-colors hover:bg-slate-800"
        onmouseenter={onMouseEnter(type)}
        onmouseleave={onMouseLeave}
      >
        <div class="flex gap-1.5 rounded-sm px-2 py-1.5 text-white">
          <button
            class="flex flex-1 justify-between"
            onclick={onClickTransformation(type)}
            ><span>{type}</span>
            <div class="flex items-center gap-1.5">
              <div class="flex items-baseline gap-1 text-slate-400">
                <Key>⌥</Key><Key>⌘</Key><Key>{type.charAt(0)}</Key>
              </div>
            </div></button
          >
          {#if Object.keys(transformations[type].params).length > 0}
            <button
              {@attach tooltip({ content: 'Adjust Parameters' })}
              onclick={onClickTransformationParams(type)}
            >
              <ChevronIcon height={10} width={10} />
            </button>
          {/if}
        </div>
        {#if type === 'Buffer' && parameterizedType === type}
          <div transition:slide>
            <BufferParams
              distance={transformations.Buffer.params.distance}
              onchange={onBufferDistanceChange}
            />
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>
