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
      const paint = codegenPaint(layer);

      return `
			map.addLayer({
				id: '${layer.id}',
				source: '${layer.id}',
				type: 'fill',
				${
          paint.fill
            ? `paint: {
					${paint.fill}
				}`
            : ''
        }
			});

			map.addLayer({
				id: '${layer.id}-stroke',
				source: '${layer.id}',
				type: 'line',
				${
          paint.stroke
            ? `paint: {
					${paint.stroke}
				}`
            : ''
        }
			});
			`;
    }
    case 'Proportional Symbol':
    case 'Dot Density': {
      const paint = codegenPaint(layer);

      return `
			map.addLayer({
				id: '${layer.id}',
				source: '${layer.id}',
				type: 'circle',
				${
          paint.fill || paint.stroke
            ? `paint: {
					${paint.fill},
					${paint.stroke}
				}`
            : ''
        }
			});
			`;
    }
  }
}
