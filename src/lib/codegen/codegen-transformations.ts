import camelCase from 'lodash.camelcase';

import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

interface TransformationProgramFragment {
  transformation: string;
  data: string;
}

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
