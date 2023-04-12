import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import {
  DEFAULT_FILL,
  DEFAULT_OPACITY,
  DEFAULT_RADIUS
} from '$lib/utils/constants';

/**
 * Generate a Mapbox GL JS program fragment representing the layer's
 * presentational properties.
 *
 * @param layer – A CartoKit layer.
 *
 * @returns – A Mapbox GL JS program fragment representing the layer's
 * presentational properties.
 */
export function codegenPaint(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Fill': {
      if (
        layer.style.fill === DEFAULT_FILL &&
        layer.style.opacity === DEFAULT_OPACITY
      ) {
        return '';
      }

      return `paint: {
				${withDefault('fill-color', layer.style.fill, DEFAULT_FILL)},
				${withDefault('fill-opacity', layer.style.opacity, DEFAULT_OPACITY)}
			}
			`;
    }
    case 'Choropleth': {
      return `paint: {
				'fill-color': ${JSON.stringify(deriveColorScale(layer))},
				${withDefault('fill-opacity', layer.style.opacity, DEFAULT_OPACITY)}
			}`;
    }
    case 'Proportional Symbol': {
      return `paint: {
				${withDefault('circle-color', layer.style.fill, DEFAULT_FILL)},
				'circle-radius': ${JSON.stringify(deriveSize(layer))},
				${withDefault('circle-opacity', layer.style.opacity, DEFAULT_OPACITY)}
			}`;
    }
    case 'Dot Density': {
      return `paint: {
				${withDefault('circle-color', layer.style.fill, DEFAULT_FILL)},
				${withDefault('circle-radius', layer.style.dots.size, DEFAULT_RADIUS)},
				${withDefault('circle-opacity', layer.style.opacity, DEFAULT_OPACITY)}
			}`;
    }
  }
}

/**
 * Return a Mapbox GL JS program fragment representing a property-value pair,
 * unless the value is the same as the default value.
 *
 * @param mapboxProperty – The Mapbox GL JS property name.
 * @param cartokitValue – The value of the property in the CartoKit IR.
 * @param defaultValue – The default Mapbox GL JS value for the property.
 *
 * @returns – A (potentially empty) Mapbox GL JS program fragment.
 */
function withDefault<T extends string | number>(
  mapboxProperty: string,
  cartokitValue: T,
  defaultValue: T
): string {
  return cartokitValue !== defaultValue
    ? `'${mapboxProperty}': ${
        typeof cartokitValue === 'string' ? `'${cartokitValue}'` : cartokitValue
      }`
    : '';
}
