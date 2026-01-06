import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { generateDotDensityPoints } from '$lib/stdlib/dot-density';
import type { CartoKitDotDensityLayer } from '$lib/types';

export async function patchDotDensityDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'dot-value': {
      const layer = ir.layers[diff.layerId] as CartoKitDotDensityLayer;

      const features = generateDotDensityPoints(
        layer.data.sourceGeojson as FeatureCollection<Polygon | MultiPolygon>,
        layer.style.dot.attribute,
        diff.payload.value
      );

      layer.style.dot.value = diff.payload.value;
      layer.data.geojson = features;

      // Update the args of the dot density transformation in this layer.
      const transformationIndex = layer.data.transformations.findIndex(
        (t) => t.name === 'generateDotDensityPoints'
      );

      if (transformationIndex > -1) {
        layer.data.transformations[transformationIndex].args = [
          layer.style.dot.attribute,
          diff.payload.value
        ];
      }

      break;
    }
    case 'dot-attribute': {
      const layer = ir.layers[diff.layerId] as CartoKitDotDensityLayer;

      const features = generateDotDensityPoints(
        layer.data.sourceGeojson as FeatureCollection<Polygon | MultiPolygon>,
        diff.payload.attribute,
        layer.style.dot.value
      );

      layer.style.dot.attribute = diff.payload.attribute;
      layer.data.geojson = features;

      // Update the args of the dot density transformation in this layer.
      const transformationIndex = layer.data.transformations.findIndex(
        (t) => t.name === 'generateDotDensityPoints'
      );

      if (transformationIndex > -1) {
        layer.data.transformations[transformationIndex].args = [
          diff.payload.attribute,
          layer.style.dot.value
        ];
      }

      break;
    }
  }

  return {
    diff,
    ir
  };
}
