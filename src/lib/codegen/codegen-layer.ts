import { codegenPaint } from '$lib/codegen/codegen-paint';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

/**
 * Generate a Mapbox GL JS program fragment for a CartoKitLayer.
 *
 * @param layer – A CartoKit layer.
 *
 * @returns – A Mapbox GL JS program fragment.
 */
export function codegenLayer(layer: CartoKitLayer): string {
  switch (layer.type) {
    case 'Fill':
    case 'Choropleth': {
      const { fill, stroke } = codegenPaint(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'fill',
          ${fill ? `paint: { ${fill} }` : ''}
        });

        map.addLayer({
          id: '${layer.id}-stroke',
          source: '${layer.id}',
          type: 'line',
          ${stroke ? `paint: { ${stroke} }` : ''}
        });
      `;
    }
    case 'Proportional Symbol':
    case 'Dot Density': {
      const { fill, stroke } = codegenPaint(layer);

      return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'circle',
          ${
            fill || stroke
              ? `paint: { ${fill ? fill + ',\n' : ''} ${stroke} }`
              : ''
          }
        });
      `;
    }
  }
}
