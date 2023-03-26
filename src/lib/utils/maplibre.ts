import type { FillLayerSpecification, MapGeoJSONFeature } from 'maplibre-gl';

/**
 * A type guard to determine if a layer is a MapLibre fill layer.
 *
 * @param layer – The MapLibre layer to test.
 * @returns – A Boolean value indicating whether the layer is a MapLibre fill layer.
 */
export function isMapLibreFillLayer(
  layer: MapGeoJSONFeature['layer']
): layer is FillLayerSpecification {
  return layer.type === 'fill';
}
