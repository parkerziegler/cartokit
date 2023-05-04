import { deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { MAPBOX_DEFAULTS } from '$lib/utils/constants';

/**
 * Generate a Mapbox GL JS program fragment representing the layer's paint
 * properties.
 *
 * @param layer – A CartoKit layer.
 *
 * @returns – A Mapbox GL JS program fragment representing the layer's paint
 * properties.
 */
export function codegenPaint(layer: CartoKitLayer): {
  fill: string;
  stroke: string;
} {
  return {
    fill: codegenFill(layer),
    stroke: codegenStroke(layer)
  };
}

/**
 * Generate a Mapbox GL JS program fragment representing the layer's fill.
 *
 * @param layer – A CartoKit layer.
 *
 * @returns – A Mapbox GL JS program fragment representing the layer's fill.
 */
function codegenFill(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Fill': {
      return intersperse(
        [
          withDefault(
            'fill-color',
            layer.style.fill,
            MAPBOX_DEFAULTS['fill-color']
          ),
          withDefault(
            'fill-opacity',
            layer.style.opacity,
            MAPBOX_DEFAULTS['fill-opacity']
          )
        ],
        ',\n'
      );
    }
    case 'Choropleth': {
      return intersperse(
        [
          `'fill-color': ${JSON.stringify(deriveColorScale(layer))}`,
          withDefault(
            'fill-opacity',
            layer.style.opacity,
            MAPBOX_DEFAULTS['fill-opacity']
          )
        ],
        ',\n'
      );
    }
    case 'Proportional Symbol': {
      return intersperse(
        [
          withDefault(
            'circle-color',
            layer.style.fill,
            MAPBOX_DEFAULTS['circle-color']
          ),
          `'circle-radius': ${JSON.stringify(deriveSize(layer))}`,
          withDefault(
            'circle-opacity',
            layer.style.opacity,
            MAPBOX_DEFAULTS['fill-opacity']
          )
        ],
        ',\n'
      );
    }
    case 'Dot Density': {
      return intersperse(
        [
          withDefault(
            'circle-color',
            layer.style.fill,
            MAPBOX_DEFAULTS['circle-color']
          ),
          withDefault(
            'circle-radius',
            layer.style.dots.size,
            MAPBOX_DEFAULTS['circle-radius']
          ),
          withDefault(
            'circle-opacity',
            layer.style.opacity,
            MAPBOX_DEFAULTS['circle-opacity']
          )
        ],
        ',\n'
      );
    }
  }
}

/**
 * Generate a Mapbox GL JS program fragment representing the layer's stroke.
 *
 * @param layer – A CartoKit layer.
 * @returns – A Mapbox GL JS program fragment representing the layer's stroke.
 */
function codegenStroke(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Fill':
    case 'Choropleth': {
      return intersperse(
        [
          withDefault(
            'line-color',
            layer.style.stroke,
            MAPBOX_DEFAULTS['line-color']
          ),
          withDefault(
            'line-width',
            layer.style.strokeWidth,
            MAPBOX_DEFAULTS['line-width']
          )
        ],
        ',\n'
      );
    }
    case 'Proportional Symbol':
    case 'Dot Density': {
      return intersperse(
        [
          withDefault(
            'circle-stroke-color',
            layer.style.stroke,
            MAPBOX_DEFAULTS['circle-stroke-color']
          ),
          withDefault(
            'circle-stroke-width',
            layer.style.strokeWidth,
            MAPBOX_DEFAULTS['circle-stroke-width']
          )
        ],
        ',\n'
      );
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

/**
 * Interperse a set of values by a separator (without leaving a dangling
 * separator after the last value).
 *
 * @param values — The input array of values to separate.
 * @param sep – A string separator between values.
 * @returns – A string with values separated by @param sep.
 */
function intersperse(values: string[], sep: string): string {
  const v = values.filter(Boolean);

  switch (v.length) {
    case 0:
      return '';
    case 1:
      return v[0];
    default:
      return v.slice(1).reduce((acc, el) => acc.concat(`${sep}${el}`), v[0]);
  }
}
