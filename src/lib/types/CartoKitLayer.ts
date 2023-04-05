import type { FeatureCollection } from 'geojson';

import type { MapType } from '$lib/types/map-types';
import type { ColorScale, ColorScheme } from '$lib/types/color';

interface Layer {
  id: string;
  displayName: string;
  type: MapType;
  data: {
    url?: string;
    geoJSON: FeatureCollection;
    rawGeoJSON: FeatureCollection;
  };
  style: {
    opacity: number;
  };
}

export interface CartoKitFillLayer extends Layer {
  type: 'Fill';
  style: {
    fill: string;
    opacity: number;
  };
}

export interface CartoKitChoroplethLayer extends Layer {
  type: 'Choropleth';
  attribute: string;
  style: {
    breaks: {
      scale: ColorScale;
      scheme: ColorScheme;
      count: number;
    };
    opacity: number;
  };
}

export interface CartoKitProportionalSymbolLayer extends Layer {
  type: 'Proportional Symbol';
  attribute: string;
  style: {
    size: {
      min: number;
      max: number;
    };
    fill: string;
    opacity: number;
  };
}

export interface CartoKitDotDensityLayer extends Layer {
  type: 'Dot Density';
  attribute: string;
  style: {
    dots: {
      size: number;
      value: number;
    };
    fill: string;
    opacity: number;
  };
}

export type CartoKitLayer =
  | CartoKitFillLayer
  | CartoKitChoroplethLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitDotDensityLayer;

/**
 * A type guard to determine if a CartoKit layer is a CartoKitFillLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitFillLayer.
 */
export function isFillLayer(layer: CartoKitLayer): layer is CartoKitFillLayer {
  return layer.type === 'Fill';
}

/**
 * A type guard to determine if a CartoKit layer is a CartoKitChoroplethLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitChoroplethLayer.
 */
export function isChoroplethLayer(
  layer: CartoKitLayer
): layer is CartoKitChoroplethLayer {
  return layer.type === 'Choropleth';
}

/**
 * A type guard to determine if a CartoKit layer is a CartoKitProportionalLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitProportionalSymbolLayer.
 */
export function isProportionalSymbolLayer(
  layer: CartoKitLayer
): layer is CartoKitProportionalSymbolLayer {
  return layer.type === 'Proportional Symbol';
}

/**
 * A type guard to determine if a CartoKit layer is a CartoKitDotDensityLayer.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer is a CartoKitDotDensityLayer.
 */
export function isDotDensityLayer(
  layer: CartoKitLayer
): layer is CartoKitDotDensityLayer {
  return layer.type === 'Dot Density';
}

/**
 * A type guard to determine if a CartoKit layer has a visualized attribute.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer has a visualized attribute.
 */
export function hasAttribute(
  layer: CartoKitLayer
): layer is
  | CartoKitChoroplethLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitDotDensityLayer {
  return 'attribute' in layer;
}

/**
 * A type guard to determine if a CartoKit layer has a fill style.
 *
 * @param layer – The layer to test.
 *
 * @returns – A Boolean value indicating whether the layer has a fill style.
 */
export function hasFill(
  layer: CartoKitLayer
): layer is CartoKitFillLayer | CartoKitProportionalSymbolLayer {
  return 'fill' in layer.style;
}
