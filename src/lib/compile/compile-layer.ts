import type { Map, AnyLayer } from 'mapbox-gl';
import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
import { compilePaint } from './compile-paint';

export const compileLayer = (map: Map, layer: CartoKitLayer, mbLayer: AnyLayer) => {
	switch (mbLayer.type) {
		case 'fill': {
			let fillColor: string | undefined = undefined;
			let fillOpacity: number | undefined = undefined;

			if (mbLayer.paint?.['fill-color']) {
				fillColor = mbLayer.paint['fill-color'];
			}

			if (mbLayer.paint?.['fill-opacity']) {
				fillOpacity = mbLayer.paint['fill-opacity'];
			}

			const paint = compilePaint({ 'fill-color': fillColor, 'fill-opacity': fillOpacity });

			return `
        map.addLayer({
          id: '${layer.id}',
          source: '${layer.id}',
          type: 'fill',
          ${paint}
        });
      `;
		}
		default:
			return '';
	}
};
