import { camelCase } from 'lodash-es';

import type { CartoKitLayer } from '$lib/types';

interface TransformationProgramFragment {
  transformation: string;
  data: string;
}

/**
 * Generate a transformation program fragment for all transformations applied
 * to a @see{CartoKitLayer}.
 *
 * @param layer - A @see{CartoKitLayer}.
 * @param uploadTable - The symbol table tracking file uploads.
 *
 * @returns - A transformation program fragment, containing both the transform-
 * ation function definition and call site.
 */
export function codegenTransformations(
  layer: CartoKitLayer,
  uploadTable: Map<string, string>
): TransformationProgramFragment {
  const transformations = layer.data.transformations;
  const dataIdent = uploadTable.get(layer.id) ?? camelCase(layer.displayName);
  const fetchData =
    layer.data.url && !uploadTable.has(layer.id)
      ? `const ${dataIdent} = await fetchGeoJSON('${layer.data.url}');\n`
      : '';

  switch (transformations.length) {
    case 0:
      return {
        transformation: '',
        data: layer.data.url ? `"${layer.data.url}"` : dataIdent
      };
    case 1:
      return {
        transformation: `${fetchData}
        ${transformations[0].definition}`,
        data: `${transformations[0].name}(${dataIdent})`
      };
    default:
      return {
        transformation: `${fetchData}
        ${transformations
          .map((transformation) => transformation.definition)
          .join('\n\n')}`,
        data: `flow(${transformations
          .map((transformation) => transformation.name)
          .join(', ')})(${dataIdent})`
      };
  }
}
