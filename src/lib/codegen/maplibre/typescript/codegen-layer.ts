import {
  codegenFill,
  codegenStroke
} from '$lib/codegen/maplibre/typescript/codegen-paint';
import type { CartoKitLayer } from '$lib/types';

/**
 * Generate a MapLibre GL JS program fragment, in TypeScript, for a
 * @see{CartoKitLayer}.
 *
 * @param layer – A @see{CartoKitLayer}.
 * @returns – A MapLibre GL JS program fragment, in TypeScript.
 */
export function codegenLayer(layer: CartoKitLayer): string {
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
          type: 'circle',
          ${
            fill || stroke
              ? `paint: { ${[fill, stroke].filter(Boolean).join(',\n')} }`
              : ''
          }
        });
      `;
    }
    case 'Line': {
      const stroke = codegenStroke(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        });
      `;
    }
    case 'Polygon': {
      let fillLayer = '';
      let strokeLayer = '';

      if (layer.style.fill) {
        const fill = codegenFill(layer);
        fillLayer = `map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'fill',
          ${fill ? `paint: { ${fill} }` : ''}
        });`;
      }

      if (layer.style.stroke) {
        const stroke = codegenStroke(layer);
        strokeLayer = `map.addLayer({
          id: '${layer.id}-stroke',
          source: '${layer.id}',
          type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        });`;
      }

      return [fillLayer, strokeLayer].filter(Boolean).join('\n\n');
    }
    case 'Choropleth': {
      const fill = codegenFill(layer);
      const fillLayer = `map.addLayer({
        id: '${layer.id}',
        source: '${layer.id}',
        type: 'fill',
        ${fill ? `paint: { ${fill} }` : ''}
      });`;

      let strokeLayer = '';

      if (layer.style.stroke) {
        const stroke = codegenStroke(layer);
        strokeLayer = `map.addLayer({
          id: '${layer.id}-stroke',
          source: '${layer.id}',
          type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        });`;
      }

      return [fillLayer, strokeLayer].filter(Boolean).join('\n\n');
    }
    case 'Heatmap': {
      const display = codegenFill(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'heatmap',
          paint: { ${display} }
        });
      `;
    }
  }
}
