import { camelCase } from 'lodash-es';

import type { CartoKitLayer, Transformation } from '$lib/types';

interface TransformationProgramFragment {
  transformation: string;
  data: string;
}

/**
 * Generate a TypeScript program fragment for a single transformation function.
 *
 * @param transformation – A @see{Transformation}.
 * @returns – A TypeScript program fragment.
 */
function codegenTransformationFn(transformation: Transformation): string {
  return `function ${transformation.name}(geojson: FeatureCollection): FeatureCollection {
  ${transformation.definition}
}`;
}

/**
 * Generate a TypeScript program fragment for all transformations applied
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
      const fn = codegenTransformationFn(transformations[0]);

      return {
        transformation: `${fetchData}
        ${fn}`,
        data: `${transformations[0].name}(${dataIdent})`
      };
    }
    default:
      return {
        transformation: `${fetchData}
        ${transformations.map(codegenTransformationFn).join('\n\n')}`,
        data: `flow(${transformations
          .map((transformation) => transformation.name)
          .join(', ')})(${dataIdent})`
      };
  }
}
