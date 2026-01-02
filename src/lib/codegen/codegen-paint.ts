import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import { deriveHeatmapWeight } from '$lib/interaction/weight';
import type { CartoKitLayer } from '$lib/types';

const DEFAULTS = {
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
  'circle-stroke-opacity': 1,
  'heatmap-radius': 30,
  'heatmap-intensity': 1,
  'heatmap-opacity': 1
};

/**
 * Generate a program fragment representing the layer's fill.
 *
 * @param layer A {@link CartoKitLayer}.
 * @returns A program fragment containing the definition of the layer's fill.
 */
export function codegenFill(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Point': {
      return [
        `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill))}`,
        withDefault(
          'circle-radius',
          layer.style.size,
          DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0,
          DEFAULTS['circle-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Proportional Symbol': {
      if (!layer.style.fill.visible) {
        return `'circle-opacity': 0`;
      }

      return [
        `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill))}`,
        `'circle-radius': ${JSON.stringify(deriveSize(layer))}`,
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0,
          DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Dot Density': {
      if (!layer.style.fill) {
        return `'circle-opacity': 0`;
      }

      return [
        withDefault(
          'circle-color',
          layer.style.fill.color,
          DEFAULTS['circle-color']
        ),
        withDefault(
          'circle-radius',
          layer.style.size,
          DEFAULTS['circle-radius']
        ),
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0,
          DEFAULTS['circle-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Line':
      return '';
    case 'Polygon': {
      if (!layer.style.fill.visible) {
        return '';
      }

      return [
        withDefault(
          'fill-color',
          layer.style.fill.color,
          DEFAULTS['fill-color']
        ),
        withDefault(
          'fill-opacity',
          layer.style.fill.opacity,
          DEFAULTS['fill-opacity']
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
          DEFAULTS['fill-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Heatmap': {
      return [
        `'heatmap-color': ${JSON.stringify(deriveColorRamp(layer.style.heatmap))}`,
        withDefault(
          'heatmap-intensity',
          layer.style.heatmap.intensity,
          DEFAULTS['heatmap-intensity']
        ),
        withDefault(
          'heatmap-opacity',
          layer.style.heatmap.opacity,
          DEFAULTS['heatmap-opacity']
        ),
        withDefault(
          'heatmap-radius',
          layer.style.heatmap.radius,
          DEFAULTS['heatmap-radius']
        ),
        `'heatmap-weight': ${JSON.stringify(deriveHeatmapWeight(layer))}`
      ]
        .filter(Boolean)
        .join(',\n');
    }
  }
}

/**
 * Generate a program fragment representing the layer's stroke.
 *
 * @param layer A {@link CartoKitLayer}.
 * @returns A program fragment containing the definition of the layer's stroke.
 */
export function codegenStroke(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Dot Density': {
      if (!layer.style.stroke.visible) {
        return '';
      }

      return [
        withDefault(
          'circle-stroke-color',
          layer.style.stroke.color,
          DEFAULTS['circle-stroke-color']
        ),
        withDefault(
          'circle-stroke-width',
          layer.style.stroke.width,
          DEFAULTS['circle-stroke-width']
        ),
        withDefault(
          'circle-stroke-opacity',
          layer.style.stroke.opacity,
          DEFAULTS['circle-stroke-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Line':
      return [
        withDefault(
          'line-color',
          layer.style.stroke.color,
          DEFAULTS['line-color']
        ),
        withDefault(
          'line-width',
          layer.style.stroke.width,
          DEFAULTS['line-width']
        ),
        withDefault(
          'line-opacity',
          layer.style.stroke.opacity,
          DEFAULTS['line-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    case 'Polygon':
    case 'Choropleth': {
      if (!layer.style.stroke.visible) {
        return '';
      }

      return [
        withDefault(
          'line-color',
          layer.style.stroke.color,
          DEFAULTS['line-color']
        ),
        withDefault(
          'line-width',
          layer.style.stroke.width,
          DEFAULTS['line-width']
        ),
        withDefault(
          'line-opacity',
          layer.style.stroke.opacity,
          DEFAULTS['line-opacity']
        )
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Heatmap': {
      return '';
    }
  }
}

/**
 * Return a program fragment representing a property-value pair,
 * unless the value is the same as the default value.
 *
 * @param property The property name.
 * @param cartokitValue The value of the property in the {@link CartoKitIR}.
 * @param defaultValue The default value for the property.
 * @returns A (potentially empty) program fragment.
 */
function withDefault<T extends string | number>(
  property: string,
  cartokitValue: T,
  defaultValue: T
): string {
  return cartokitValue !== defaultValue
    ? `'${property}': ${
        typeof cartokitValue === 'string' ? `'${cartokitValue}'` : cartokitValue
      }`
    : '';
}
