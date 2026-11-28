import {
  type GeoJSONSource,
  type LngLat,
  type Map,
  Marker,
  type MarkerDragEvent
} from 'maplibre-gl';
import { get } from 'svelte/store';

import { applyDiff } from '#lib/core/diff/index.ts';
import { db } from '#lib/state/db.svelte.ts';
import { ir } from '#lib/stores/ir.ts';
import type { DuckDBTable } from '#lib/types/db.ts';
import type { Direction } from '#lib/types/transformation.ts';
import { DEFAULT_SELECTION_COLOR } from '#lib/utils/constants.ts';
import {
  generateViewportTransformationQuery,
  invalidatePreviewQueries,
  quoteIdentifier,
  runPreviewQuery
} from '#lib/utils/db.ts';
import {
  offsetAlongAxis,
  signedDistanceAlongAxis
} from '#lib/utils/transformation.ts';

/** Module-level state storing the control points currently on the map. */
let activeControlPoints: Marker[] = [];

interface ShowControlPointsParams {
  featureId: number;
  layerId: string;
  map: Map;
  signal: AbortSignal;
}

/**
 * Show drag control points for a feature in a layer, replacing any control
 * points currently on the map. Control points sit at the midpoints of the edges
 * of the feature's bounding box.
 *
 * @param params The {@link ShowControlPointsParams}.
 * @param params.featureId The id of the selected feature.
 * @param params.layerId The id of the layer.
 * @param params.map The top-level {@link Map} instance.
 * @param params.signal An {@link AbortSignal} indicating that control point
 * rendering should be abandoned.
 */
export async function showControlPoints({
  featureId,
  layerId,
  map,
  signal
}: ShowControlPointsParams) {
  hideControlPoints();

  const { source } = get(ir).layers[layerId];

  if (
    source.type !== 'table' ||
    source.location.transformation.type !== 'Buffer'
  ) {
    return;
  }

  const geom = quoteIdentifier(source.table.geometryColumn);
  const bounds = (
    await db.value!.conn.query(`
      SELECT
        ST_XMin(${geom}) AS west,
        ST_YMin(${geom}) AS south,
        ST_XMax(${geom}) AS east,
        ST_YMax(${geom}) AS north
      FROM ${layerId}
      WHERE rowid = ${featureId};`)
  ).toArray()[0];

  if (signal.aborted || !bounds) {
    return;
  }

  const { west, south, east, north } = bounds;
  const handleLocations: { direction: Direction; lng: number; lat: number }[] =
    [
      { direction: 'North', lng: (east - west) / 2 + west, lat: north },
      { direction: 'East', lng: east, lat: (north - south) / 2 + south },
      { direction: 'South', lng: (east - west) / 2 + west, lat: south },
      { direction: 'West', lng: west, lat: (north - south) / 2 + south }
    ];

  const controlPoints = handleLocations.map(({ direction, lng, lat }) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="8" height="8" viewBox="0 0 8 8">
        <rect x="0.5" y="0.5" width="7" height="7" fill="#ffffff" stroke="${DEFAULT_SELECTION_COLOR}" stroke-width="1" />
      </svg>
    `;
    el.style.cursor = 'grab';

    const marker = new Marker({
      element: el,
      draggable: true,
      anchor: 'center'
    })
      .setLngLat({ lng, lat })
      .addTo(map);

    return { marker, direction, lng, lat };
  });

  controlPoints.forEach(({ marker, direction, lng, lat }) => {
    const { onDrag, onDragEnd } = createControlPointHandlers({
      bufferDistance: source.location.transformation.args.distance,
      controlPoints,
      direction,
      lat,
      layerId,
      lng,
      map,
      marker,
      parentLayerId: source.location.parentLayerId,
      table: source.table
    });

    marker.on('drag', onDrag);
    marker.on('dragend', onDragEnd);
  });

  activeControlPoints = controlPoints.map(({ marker }) => marker);
}

/**
 * Remove all control points from the map.
 */
export function hideControlPoints(): void {
  activeControlPoints.forEach((marker) => marker.remove());
  activeControlPoints = [];
}

/**
 * Constrain a dragged control point to the axis of its direction.
 *
 * @param direction The cardinal direction of the control point.
 * @param origin The [lng, lat] of the control point before dragging.
 * @param dragged The dragged position of the control point.
 * @returns The constrained [lng, lat].
 */
function constrainToAxis(
  direction: Direction,
  [originLng, originLat]: [number, number],
  { lng, lat }: LngLat
): [number, number] {
  return direction === 'East' || direction === 'West'
    ? [lng, originLat]
    : [originLng, lat];
}

interface CreateControlPointHandlersParams {
  bufferDistance: number;
  controlPoints: {
    marker: Marker;
    direction: Direction;
    lng: number;
    lat: number;
  }[];
  direction: Direction;
  lat: number;
  layerId: string;
  lng: number;
  map: Map;
  marker: Marker;
  parentLayerId: string;
  table: DuckDBTable;
}

/**
 * Create the event handlers for a buffer control point.
 *
 * @param params The {@link CreateControlPointHandlersParams}.
 * @param params.bufferDistance The layer's buffer distance, in meters, before
 * dragging.
 * @param params.controlPoints All control points of the selected feature.
 * @param params.direction The {@link Direction} of the control point.
 * @param params.lat The latitude of the control point before dragging.
 * @param params.layerId The id of the Buffer layer.
 * @param params.lng The longitude of the control point before dragging.
 * @param params.map The top-level {@link Map} instance.
 * @param params.marker The dragged control point's {@link Marker} instance.
 * @param params.parentLayerId The id of the Buffer layer's parent layer.
 * @param params.table The parent layer's {@link DuckDBTable}.
 * @returns The control point's drag and dragend handlers.
 */
function createControlPointHandlers({
  bufferDistance,
  controlPoints,
  direction,
  lat,
  layerId,
  lng,
  map,
  marker,
  parentLayerId,
  table
}: CreateControlPointHandlersParams) {
  async function onDrag(e: MarkerDragEvent) {
    const target = constrainToAxis(direction, [lng, lat], e.target.getLngLat());
    marker.setLngLat(target);

    const delta = signedDistanceAlongAxis(direction, [lng, lat], target);

    for (const cp of controlPoints) {
      if (cp.marker !== marker) {
        cp.marker.setLngLat(
          offsetAlongAxis(cp.direction, [cp.lng, cp.lat], delta)
        );
      }
    }

    // Preview the new buffer on features in the viewport only.
    const bounds = map.getBounds();
    const query = generateViewportTransformationQuery({
      parentLayerId,
      transformation: {
        type: 'Buffer',
        args: { distance: bufferDistance + delta }
      },
      table,
      bounds: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ]
    });
    const geojson = await runPreviewQuery(db.value!.conn, query);

    // Superseded by a newer preview, or invalidated on dragend.
    if (!geojson) {
      return;
    }

    map.getSource<GeoJSONSource>(layerId)?.setData(geojson);
  }

  async function onDragEnd() {
    await invalidatePreviewQueries(db.value!.conn);

    const target = constrainToAxis(direction, [lng, lat], marker.getLngLat());
    marker.setLngLat(target);

    const delta = signedDistanceAlongAxis(direction, [lng, lat], target);
    if (delta === 0) {
      return;
    }

    await applyDiff({
      layerId,
      type: 'update-buffer-distance',
      payload: { distance: bufferDistance + delta }
    });
  }

  return { onDrag, onDragEnd };
}
