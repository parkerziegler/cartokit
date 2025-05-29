import { camelCase } from 'lodash-es';

import type { CartoKitLayer } from '$lib/types';

interface TransformationProgramFragment {
  transformation: string;
  data: string;
}

/**
 * Generate a JavaScript program fragment for all transformations applied
 * to a @see{CartoKitLayer}.
 *
 * @param layer - A @see{CartoKitLayer}.
 * @param uploadTable - The symbol table tracking file uploads.
 * @returns - A @see{TransformationProgramFragment}, containing both the trans-
 * formation function definition and call site.
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
    case 1: {
      return {
        transformation: fetchData,
        data: `${transformations[0].name}(${dataIdent}${
          transformations[0].args.length > 0
            ? `, ${transformations[0].args.join(', ')}`
            : ''
        })`
      };
    }
    default: {
      const callSite = transformations.reduce((acc, transformation, i) => {
        if (i === 0) {
          return `${transformation.name}(${dataIdent}${
            transformation.args.length > 0
              ? `, ${transformation.args.join(', ')}`
              : ''
          })`;
        }

        return `${transformation.name}(${acc}, ${transformation.args.join(', ')})`;
      }, '');

      return {
        transformation: fetchData,
        data: callSite
      };
    }
  }
}
