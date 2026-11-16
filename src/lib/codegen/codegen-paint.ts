import { prop, props, withDefault } from '#lib/codegen/utils.ts';
import { deriveColorRamp, deriveColorScale } from '#lib/interaction/color.ts';
import { deriveSize } from '#lib/interaction/geometry.ts';
import { deriveHeatmapWeight } from '#lib/interaction/weight.ts';
import type {
  CartoKitLayer,
  CartoKitPointLayer,
  CartoKitProportionalSymbolLayer,
  ConstantStroke
} from '#lib/types/index.ts';

/**
 * Generate a program fragment representing the fill color of a circle layer.
 *
 * @param layer A {@link CartoKitPointLayer} or
 * {@link CartoKitProportionalSymbolLayer}.
 * @returns A (potentially empty) program fragment.
 */
function codegenCircleColor(
  layer: CartoKitPointLayer | CartoKitProportionalSymbolLayer
): string {
  return layer.style.fill.type === 'Constant'
    ? withDefault('circle-color', layer.style.fill.color)
    : prop('circle-color', deriveColorScale(layer.style.fill, layer.id));
}

/**
 * Generate a program fragment representing the stroke of a line layer.
 *
 * @param stroke A {@link ConstantStroke}.
 * @returns A (potentially empty) program fragment.
 */
function codegenLineStroke(stroke: ConstantStroke): string {
  return props(
    withDefault('line-color', stroke.color),
    withDefault('line-width', stroke.width),
    withDefault('line-opacity', stroke.opacity)
  );
}

/**
 * Generate a program fragment representing the layer's fill.
 *
 * @param layer A {@link CartoKitLayer}.
 * @returns A program fragment containing the definition of the layer's fill.
 */
export function codegenFill(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Point':
      return props(
        codegenCircleColor(layer),
        withDefault('circle-radius', layer.style.size),
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0
        )
      );
    case 'Proportional Symbol':
      if (!layer.style.fill.visible) {
        return prop('circle-opacity', 0);
      }

      return props(
        codegenCircleColor(layer),
        prop('circle-radius', deriveSize(layer.id, layer.style.size)),
        withDefault('circle-opacity', layer.style.fill.opacity)
      );
    case 'Line':
      return '';
    case 'Polygon':
      if (!layer.style.fill.visible) {
        return '';
      }

      return props(
        withDefault('fill-color', layer.style.fill.color),
        withDefault('fill-opacity', layer.style.fill.opacity)
      );
    case 'Choropleth':
      return props(
        prop('fill-color', deriveColorScale(layer.style.fill, layer.id)),
        withDefault('fill-opacity', layer.style.fill.opacity)
      );
    case 'Heatmap':
      return props(
        prop('heatmap-color', deriveColorRamp(layer.style.heatmap)),
        withDefault('heatmap-intensity', layer.style.heatmap.intensity),
        withDefault('heatmap-opacity', layer.style.heatmap.opacity),
        withDefault('heatmap-radius', layer.style.heatmap.radius),
        prop('heatmap-weight', deriveHeatmapWeight(layer))
      );
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
      if (!layer.style.stroke.visible) {
        return '';
      }

      return props(
        withDefault('circle-stroke-color', layer.style.stroke.color),
        withDefault('circle-stroke-width', layer.style.stroke.width),
        withDefault('circle-stroke-opacity', layer.style.stroke.opacity)
      );
    case 'Line':
      return codegenLineStroke(layer.style.stroke);
    case 'Polygon':
    case 'Choropleth':
      return layer.style.stroke.visible
        ? codegenLineStroke(layer.style.stroke)
        : '';
    case 'Heatmap':
      return '';
  }
}
