import { withDefault } from '$lib/codegen/utils';
import { deriveColorRamp, deriveColorScale } from '$lib/interaction/color';
import { deriveSize } from '$lib/interaction/geometry';
import { deriveHeatmapWeight } from '$lib/interaction/weight';
import type { CartoKitLayer } from '$lib/types';

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
        layer.style.fill.type === 'Constant'
          ? withDefault('circle-color', layer.style.fill.color)
          : `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill, layer.id))}`,
        withDefault('circle-radius', layer.style.size),
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0
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
        layer.style.fill.type === 'Constant'
          ? withDefault('circle-color', layer.style.fill.color)
          : `'circle-color': ${JSON.stringify(deriveColorScale(layer.style.fill, layer.id))}`,
        `'circle-radius': ${JSON.stringify(deriveSize(layer.id, layer.style.size))}`,
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0
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
        withDefault('circle-color', layer.style.fill.color),
        withDefault('circle-radius', layer.style.size),
        withDefault(
          'circle-opacity',
          layer.style.fill.visible ? layer.style.fill.opacity : 0
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
        withDefault('fill-color', layer.style.fill.color),
        withDefault('fill-opacity', layer.style.fill.opacity)
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Choropleth': {
      return [
        `'fill-color': ${JSON.stringify(deriveColorScale(layer.style.fill, layer.id))}`,
        withDefault('fill-opacity', layer.style.fill.opacity)
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Heatmap': {
      return [
        `'heatmap-color': ${JSON.stringify(deriveColorRamp(layer.style.heatmap))}`,
        withDefault('heatmap-intensity', layer.style.heatmap.intensity),
        withDefault('heatmap-opacity', layer.style.heatmap.opacity),
        withDefault('heatmap-radius', layer.style.heatmap.radius),
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
        withDefault('circle-stroke-color', layer.style.stroke.color),
        withDefault('circle-stroke-width', layer.style.stroke.width),
        withDefault('circle-stroke-opacity', layer.style.stroke.opacity)
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Line':
      return [
        withDefault('line-color', layer.style.stroke.color),
        withDefault('line-width', layer.style.stroke.width),
        withDefault('line-opacity', layer.style.stroke.opacity)
      ]
        .filter(Boolean)
        .join(',\n');
    case 'Polygon':
    case 'Choropleth': {
      if (!layer.style.stroke.visible) {
        return '';
      }

      return [
        withDefault('line-color', layer.style.stroke.color),
        withDefault('line-width', layer.style.stroke.width),
        withDefault('line-opacity', layer.style.stroke.opacity)
      ]
        .filter(Boolean)
        .join(',\n');
    }
    case 'Heatmap': {
      return '';
    }
  }
}
