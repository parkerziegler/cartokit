import type { Layer, FillLayer } from 'mapbox-gl';

export function isMapboxFillLayer(layer: Layer | undefined): layer is FillLayer {
	return layer?.type === 'fill';
}
