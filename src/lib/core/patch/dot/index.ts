import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import {
  deriveDotDensityStartingValue,
  generateDotDensityPoints
} from '$lib/stdlib/dot-density';
import type { CartoKitDotDensityLayer } from '$lib/types';

/**
 * Patch dot-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchDotDiffs(
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

      // Rederive a starting dot value based on the range of the new attribute.
      const dotValue = deriveDotDensityStartingValue(
        layer.data.sourceGeojson.features,
        diff.payload.attribute
      );

      // Generate the new dot density points.
      const features = generateDotDensityPoints(
        layer.data.sourceGeojson as FeatureCollection<Polygon | MultiPolygon>,
        diff.payload.attribute,
        dotValue
      );

      layer.style.dot.attribute = diff.payload.attribute;
      layer.style.dot.value = dotValue;
      layer.data.geojson = features;

      // Update the args of the dot density transformation in this layer.
      const transformationIndex = layer.data.transformations.findIndex(
        (t) => t.name === 'generateDotDensityPoints'
      );

      if (transformationIndex > -1) {
        layer.data.transformations[transformationIndex].args = [
          diff.payload.attribute,
          dotValue
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
