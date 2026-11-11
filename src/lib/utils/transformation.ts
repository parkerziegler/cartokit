/**
 * Get a default buffering distance, in meters, based on the Zoom level.
 *
 * @param zoom The current zoom level of the map.
 * @returns The default buffering distance, in meters.
 */
export function getDefaultBufferDistanceByZoom(zoom: number) {
  if (zoom < 2) {
    return 500_000;
  } else if (zoom < 4) {
    return 250_000;
  } else if (zoom < 6) {
    return 100_000;
  } else if (zoom < 8) {
    return 50_000;
  } else if (zoom < 10) {
    return 25_000;
  } else if (zoom < 12) {
    return 10_000;
  } else if (zoom < 14) {
    return 5_000;
  } else if (zoom < 16) {
    return 2_500;
  }

  return 1000;
}
