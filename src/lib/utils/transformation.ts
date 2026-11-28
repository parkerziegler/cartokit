import {
  degreesToRadians,
  lengthToDegrees,
  rhumbDestination,
  rhumbDistance
} from '@turf/turf';
import type { Geometry } from 'geojson';

import type { Direction, Transformation } from '#lib/types/transformation.ts';

export const SF_GEOMETRY_TYPES_TO_TRANSFORMATIONS = new Map<
  Geometry['type'],
  Transformation['type'][]
>([
  ['Point', ['Buffer']],
  ['MultiPoint', ['Buffer']],
  ['LineString', ['Buffer', 'Centroid', 'Envelope']],
  ['MultiLineString', ['Buffer', 'Centroid', 'Envelope']],
  ['Polygon', ['Buffer', 'Centroid', 'Envelope']],
  ['MultiPolygon', ['Buffer', 'Centroid', 'Envelope']],
  ['GeometryCollection', []]
]);

/**
 * Get a default buffering distance, in meters, based on the Zoom level.
 *
 * @param zoom The current zoom level of the map.
 * @returns The default buffering distance, in meters.
 */
export function getDefaultBufferDistanceByZoom(zoom: number) {
  if (zoom < 2) {
    return 250_000;
  } else if (zoom < 4) {
    return 100_000;
  } else if (zoom < 6) {
    return 50_000;
  } else if (zoom < 8) {
    return 25_000;
  } else if (zoom < 10) {
    return 10_000;
  } else if (zoom < 12) {
    return 5_000;
  } else if (zoom < 14) {
    return 2_500;
  } else if (zoom < 16) {
    return 1_000;
  }

  return 500;
}

/** Rhumb-line bearings, in degrees, for each cardinal direction. */
const DIRECTION_BEARINGS: Record<Direction, number> = {
  North: 0,
  East: 90,
  South: 180,
  West: 270
};

/**
 * Determine whether a target point lies "outward" from an origin point.
 *
 * @param direction The {@link Direction} of the origin point.
 * @param origin The [lng, lat] of the origin point.
 * @param target The [lng, lat] of the target point.
 * @returns Whether the target lies outward.
 */
function isOutward(
  direction: Direction,
  [originLng, originLat]: [number, number],
  [targetLng, targetLat]: [number, number]
): boolean {
  switch (direction) {
    case 'North':
      return targetLat >= originLat;
    case 'South':
      return targetLat <= originLat;
    case 'East':
      return targetLng >= originLng;
    case 'West':
      return targetLng <= originLng;
  }
}

/**
 * Compute the signed distance, in meters, between an origin point and a target
 * point along the origin point's axis. Positive when the target lies outward,
 * negative when inward. Measured along a rhumb line, which follows the meridian
 * (North-South) or parallel (East-West).
 *
 * @param direction The {@link Direction} of the origin point.
 * @param origin The [lng, lat] of the origin point.
 * @param target The [lng, lat] of the target point.
 * @returns The signed distance, in meters.
 */
export function signedDistanceAlongAxis(
  direction: Direction,
  origin: [number, number],
  target: [number, number]
): number {
  const meters = rhumbDistance(origin, target, { units: 'meters' });

  return isOutward(direction, origin, target) ? meters : -meters;
}

/**
 * Offset an origin point by a signed distance along its axis. The inverse of
 * {@link signedDistanceAlongAxis}.
 *
 * @param direction The {@link Direction} of the origin point.
 * @param origin The [lng, lat] of the origin point.
 * @param target The [lng, lat] of the target point.
 * @returns The [lng, lat] of the offset control point.
 */
export function offsetAlongAxis(
  direction: Direction,
  origin: [number, number],
  meters: number
): [number, number] {
  const [lng, lat] = rhumbDestination(
    origin,
    meters,
    DIRECTION_BEARINGS[direction],
    { units: 'meters' }
  ).geometry.coordinates;

  return [lng, lat];
}

/**
 * Pad viewport bounds so that features whose transformed geometry reaches into
 * the viewport, but whose original geometry lies outside of it, are still
 * selected.
 *
 * @param transformation The {@link Transformation} being applied.
 * @param bounds The viewport bounds, as [west, south, east, north].
 * @returns The padded bounds, as [west, south, east, north].
 */
export function padBoundsForTransformation(
  transformation: Transformation,
  [west, south, east, north]: [number, number, number, number]
): [number, number, number, number] {
  if (transformation.type !== 'Buffer') {
    return [west, south, east, north];
  }

  // Pad the viewport latitude by the buffer distance.
  const latPad = lengthToDegrees(
    Math.max(transformation.args.distance, 0),
    'meters'
  );

  // Pad the viewport longitude by the buffer distance. We account for shrinking
  // longitudes near the poles by using the viewport latitude closest to a pole
  // in the formula lngPad = latPad / cos φ.
  const maxAbsLat = Math.min(Math.max(Math.abs(south), Math.abs(north)), 89);
  const lngPad = latPad / Math.cos(degreesToRadians(maxAbsLat));

  return [
    Math.max(west - lngPad, -180),
    Math.max(south - latPad, -90),
    Math.min(east + lngPad, 180),
    Math.min(north + latPad, 90)
  ];
}
