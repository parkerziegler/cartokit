export interface CartoKitLayer {
	name: string;
	type: string;
	data: string; // Need to extend to valid GeoJSON.
	attribute: string;
}

export const compileLayer = (layer: CartoKitLayer): string => {
	return `map.addSource('${layer.name}', {
    type: 'geojson',
    data: '${layer.data}'
  });
`;
};
