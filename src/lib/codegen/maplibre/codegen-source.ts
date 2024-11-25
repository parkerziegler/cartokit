import { codegenTransformations } from '$lib/codegen/maplibre/codegen-transformations';
import type { CartoKitLayer } from '$lib/types';

/**
 * Generate code to add a data source for a @see{CartoKitLayer} to a MapLibre GL
 * JS map.
 *
 * @param layer – A @see{CartoKitLayer}.
 * @param uploadTable – The symbol table tracking file uploads.
 * @returns – A JavaScript program fragment containing code to add a data source
 * for a @see{CartoKitLayer} to a MapLibre GL JS map.
 */
export function codegenSource(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
): string {
  const { transformation, data } = codegenTransformations(layer, uploadTable);

  return `
  ${transformation}

  map.addSource('${layer.id}', {
		type: 'geojson',
		data: ${data}
	});
  `;
}
