import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import type { CartoKitLayer } from '$lib/types';
import { MAPBOX_DEFAULTS } from '$lib/utils/constants';

/**
 * Generate a Mapbox GL JS program fragment representing the layer's fill.
 *
 * @param {CartoKitLayer} layer – A @see{CartoKitLayer}.
 * @returns {string} – A Mapbox GL JS program fragment representing the layer's
 * fill.
 */
export function codegenFill(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Point': {
      if (!layer.style.fill) {
        return '';
      }

      return [
        `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill))}`,
        withDefault(
          'circle-radius',
          layer.style.size,
          MAPBOX_DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.opacity,
          MAPBOX_DEFAULTS['circle-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Proportional Symbol': {
      if (!layer.style.fill) {
        return '';
      }

      return [
        `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill))}`,
        `'circle-radius': ${JSON.stringify(deriveSize(layer))}`,
        withDefault(
          'circle-opacity',
          layer.style.fill.opacity,
          MAPBOX_DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Dot Density': {
      if (!layer.style.fill) {
        return '';
      }

      return [
        withDefault(
          'circle-color',
          layer.style.fill.color,
          MAPBOX_DEFAULTS['circle-color']
        ),
        withDefault(
          'circle-radius',
          layer.style.dots.size,
          MAPBOX_DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.opacity,
          MAPBOX_DEFAULTS['circle-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Line':
      return '';
    case 'Polygon': {
      if (!layer.style.fill) {
        return '';
      }

      return [
        withDefault(
          'fill-color',
          layer.style.fill.color,
          MAPBOX_DEFAULTS['fill-color']
        ),
        withDefault(
          'fill-opacity',
          layer.style.fill.opacity,
          MAPBOX_DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Choropleth': {
      return [
        `'fill-color': ${JSON.stringify(deriveColorScale(layer.style.fill))}`,
        withDefault(
          'fill-opacity',
          layer.style.fill.opacity,
          MAPBOX_DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
  }
}

/**
 * Generate a Mapbox GL JS program fragment representing the layer's stroke.
 *
 * @param {CartoKitLayer} layer – A @see{CartoKitLayer}.
 * @returns {string} – A Mapbox GL JS program fragment representing the layer's
 * stroke.
 */
export function codegenStroke(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Dot Density': {
      if (!layer.style.stroke) {
        return '';
      }

      return [
        withDefault(
          'circle-stroke-color',
          layer.style.stroke.color,
          MAPBOX_DEFAULTS['circle-stroke-color']
        ),
        withDefault(
          'circle-stroke-width',
          layer.style.stroke.width,
          MAPBOX_DEFAULTS['circle-stroke-width']
        ),
        withDefault(
          'circle-stroke-opacity',
          layer.style.stroke.opacity,
          MAPBOX_DEFAULTS['circle-stroke-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Line':
    case 'Polygon':
    case 'Choropleth': {
      if (!layer.style.stroke) {
        return '';
      }

      return [
        withDefault(
          'line-color',
          layer.style.stroke.color,
          MAPBOX_DEFAULTS['line-color']
        ),
        withDefault(
          'line-width',
          layer.style.stroke.width,
          MAPBOX_DEFAULTS['line-width']
        ),
        withDefault(
          'line-opacity',
          layer.style.stroke.opacity,
          MAPBOX_DEFAULTS['line-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
  }
}

/**
 * Return a Mapbox GL JS program fragment representing a property-value pair,
 * unless the value is the same as the default value.
 *
 * @param {string} mapboxProperty – The Mapbox GL JS property name.
 * @param {T} cartokitValue – The value of the property in the CartoKit IR.
 * @param {T} defaultValue – The default Mapbox GL JS value for the property.
 * @returns {string} – A (potentially empty) Mapbox GL JS program fragment.
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
