import { codegenFill, codegenStroke } from '$lib/codegen/codegen-paint';
import type { CartoKitLayer } from '$lib/types';

/**
 * Generate a program fragment for a {@link CartoKitLayer}.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param beforeId The id of the layer beneath which to insert this layer.
 * @returns A program fragment containing the definition of a layer, with an
 * accompanying call to add the layer to the map.
 */
export function codegenLayer(layer: CartoKitLayer, beforeId?: string): string {
  const sourceLayer =
    layer.source.type === 'vector'
      ? `'source-layer': '${layer.source.sourceLayerId}',\n`
      : '';
  const beforeLayer = beforeId ? `, '${beforeId}'` : '';

  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
    case 'Dot Density': {
      const fill = codegenFill(layer);
      const stroke = codegenStroke(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          ${sourceLayer}type: 'circle',
          ${
            fill || stroke
              ? `paint: { ${[fill, stroke].filter(Boolean).join(',\n')} }`
              : ''
          }
        }${beforeLayer});
      `;
    }
    case 'Line': {
      const stroke = codegenStroke(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          ${sourceLayer}type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        }${beforeLayer});
      `;
    }
    case 'Polygon': {
      let fillLayer = '';
      let strokeLayer = '';

      if (layer.style.fill.visible) {
        const fill = codegenFill(layer);
        fillLayer = `map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          ${sourceLayer}type: 'fill',
          ${fill ? `paint: { ${fill} }` : ''}
        }${beforeLayer});`;
      }

      if (layer.style.stroke.visible) {
        const stroke = codegenStroke(layer);
        strokeLayer = `map.addLayer({
          id: '${layer.id}-stroke',
          source: '${layer.id}',
          ${sourceLayer}type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        }${beforeLayer});`;
      }

      return [fillLayer, strokeLayer].filter(Boolean).join('\n\n');
    }
    case 'Choropleth': {
      const fill = codegenFill(layer);
      const fillLayer = `map.addLayer({
        id: '${layer.id}',
        source: '${layer.id}',
        ${sourceLayer}type: 'fill',
        ${fill ? `paint: { ${fill} }` : ''}
      }${beforeLayer});`;

      let strokeLayer = '';

      if (layer.style.stroke.visible) {
        const stroke = codegenStroke(layer);
        strokeLayer = `map.addLayer({
          id: '${layer.id}-stroke',
          source: '${layer.id}',
          ${sourceLayer}type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        }${beforeLayer});`;
      }

      return [fillLayer, strokeLayer].filter(Boolean).join('\n\n');
    }
    case 'Heatmap': {
      const display = codegenFill(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          ${sourceLayer}type: 'heatmap',
          paint: { ${display} }
        }${beforeLayer});
      `;
    }
  }
}
