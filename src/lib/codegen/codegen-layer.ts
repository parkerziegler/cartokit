import { codegenFill, codegenStroke } from '$lib/codegen/codegen-paint';
import type { CartoKitLayer } from '$lib/types';

/**
 * Generate a Mapbox GL JS program fragment for a CartoKitLayer.
 *
 * @param layer – A @see{CartoKitLayer}.
 *
 * @returns – A Mapbox GL JS program fragment.
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
  }
}
