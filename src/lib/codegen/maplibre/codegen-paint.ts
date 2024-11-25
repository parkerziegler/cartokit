import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import type { CartoKitLayer } from '$lib/types';

const MAPLIBRE_DEFAULTS = {
  'circle-radius': 5,
  'fill-color': '#000000',
  'line-color': '#000000',
  'fill-opacity': 1,
  'line-opacity': 1,
  'line-width': 1,
  'circle-color': '#000000',
  'circle-opacity': 1,
  'circle-stroke-color': '#000000',
  'circle-stroke-width': 0,
  'circle-stroke-opacity': 1
};

/**
 * Generate a MapLibre GL JS program fragment representing the layer's fill.
 *
 * @param {CartoKitLayer} layer – A @see{CartoKitLayer}.
 * @returns {string} – A MapLibre GL JS program fragment representing the
 * layer's fill.
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
          MAPLIBRE_DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.opacity,
          MAPLIBRE_DEFAULTS['circle-opacity']
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
          MAPLIBRE_DEFAULTS['fill-opacity']
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
          MAPLIBRE_DEFAULTS['circle-color']
        ),
        withDefault(
          'circle-radius',
          layer.style.dots.size,
          MAPLIBRE_DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.opacity,
          MAPLIBRE_DEFAULTS['circle-opacity']
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
          MAPLIBRE_DEFAULTS['fill-color']
        ),
        withDefault(
          'fill-opacity',
          layer.style.fill.opacity,
          MAPLIBRE_DEFAULTS['fill-opacity']
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
          MAPLIBRE_DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
  }
}

/**
 * Generate a MapLibre GL JS program fragment representing the layer's stroke.
 *
 * @param {CartoKitLayer} layer – A @see{CartoKitLayer}.
 * @returns {string} – A MapLibre GL JS program fragment representing the
 * layer's stroke.
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
          MAPLIBRE_DEFAULTS['circle-stroke-color']
        ),
        withDefault(
          'circle-stroke-width',
          layer.style.stroke.width,
          MAPLIBRE_DEFAULTS['circle-stroke-width']
        ),
        withDefault(
          'circle-stroke-opacity',
          layer.style.stroke.opacity,
          MAPLIBRE_DEFAULTS['circle-stroke-opacity']
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
          MAPLIBRE_DEFAULTS['line-color']
        ),
        withDefault(
          'line-width',
          layer.style.stroke.width,
          MAPLIBRE_DEFAULTS['line-width']
        ),
        withDefault(
          'line-opacity',
          layer.style.stroke.opacity,
          MAPLIBRE_DEFAULTS['line-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
  }
}

/**
 * Return a MapLibre GL JS program fragment representing a property-value pair,
 * unless the value is the same as the default value.
 *
 * @param maplibreProperty – The MapLibre GL JS property name.
 * @param cartokitValue – The value of the property in the CartoKit IR.
 * @param defaultValue – The default MapLibre GL JS value for the property.
 * @returns – A (potentially empty) MapLibre GL JS program fragment.
 */
function withDefault<T extends string | number>(
  maplibreProperty: string,
  cartokitValue: T,
  defaultValue: T
): string {
  return cartokitValue !== defaultValue
    ? `'${maplibreProperty}': ${
        typeof cartokitValue === 'string' ? `'${cartokitValue}'` : cartokitValue
      }`
    : '';
}
