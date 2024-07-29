import { codegenTransformations } from '$lib/codegen/codegen-transformations';
import type { CartoKitLayer } from '$lib/types';

/**
 * Generate the data source for a @see{CartoKitLayer}.
 *
 * @param layer – A @see{CartoKitLayer}.
 * @param uploadTable – The symbol table tracking file uploads.
 *
 * @returns – A Mapbox GL JS program fragment.
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
