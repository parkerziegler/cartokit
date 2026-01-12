import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import type { CartoKitHeatmapLayer } from '$lib/types';
import { selectQuantitativeAttribute } from '$lib/utils/geojson';

/**
 * Patch heatmap-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchHeatmapDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'heatmap-opacity': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'heatmap-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.heatmap.opacity
        }
      };

      // Apply the patch.
      layer.style.heatmap.opacity = diff.payload.opacity;

      break;
    }
    case 'heatmap-radius': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'heatmap-radius',
        layerId: diff.layerId,
        payload: {
          radius: layer.style.heatmap.radius
        }
      };

      // Apply the patch.
      layer.style.heatmap.radius = diff.payload.radius;

      break;
    }
    case 'heatmap-ramp': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'heatmap-ramp',
        layerId: diff.layerId,
        payload: {
          ramp: layer.style.heatmap.ramp.id
        }
      };

      // Apply the patch.
      layer.style.heatmap.ramp.id = diff.payload.ramp;

      break;
    }
    case 'heatmap-ramp-direction': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'heatmap-ramp-direction',
        layerId: diff.layerId,
        payload: {
          direction: layer.style.heatmap.ramp.direction
        }
      };

      // Apply the patch.
      layer.style.heatmap.ramp.direction = diff.payload.direction;

      break;
    }
    case 'heatmap-weight-type': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'heatmap-weight-type',
        layerId: diff.layerId,
        payload: {
          weightType: layer.style.heatmap.weight.type
        }
      };

      // Apply the patch.
      if (diff.payload.weightType === 'Constant') {
        layer.style.heatmap.weight = {
          type: 'Constant',
          value: 1
        };
      } else if (diff.payload.weightType === 'Quantitative') {
        layer.style.heatmap.weight = {
          type: 'Quantitative',
          attribute: selectQuantitativeAttribute(layer.data.geojson.features),
          min: 0,
          max: 1
        };
      }

      break;
    }
    case 'heatmap-weight-attribute': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'heatmap-weight-attribute',
          layerId: diff.layerId,
          payload: {
            weightAttribute: layer.style.heatmap.weight.attribute
          }
        };

        // Apply the patch.
        layer.style.heatmap.weight.attribute = diff.payload.weightAttribute;
      }

      break;
    }
    case 'heatmap-weight-min': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'heatmap-weight-min',
          layerId: diff.layerId,
          payload: {
            min: layer.style.heatmap.weight.min
          }
        };

        // Apply the patch.
        layer.style.heatmap.weight.min = diff.payload.min;
      }

      break;
    }
    case 'heatmap-weight-max': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Quantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'heatmap-weight-max',
          layerId: diff.layerId,
          payload: {
            max: layer.style.heatmap.weight.max
          }
        };

        // Apply the patch.
        layer.style.heatmap.weight.max = diff.payload.max;
      }

      break;
    }
    case 'heatmap-weight-value': {
      const layer = ir.layers[diff.layerId] as CartoKitHeatmapLayer;

      if (layer.style.heatmap.weight.type === 'Constant') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'heatmap-weight-value',
          layerId: diff.layerId,
          payload: {
            value: layer.style.heatmap.weight.value
          }
        };

        // Apply the patch.
        layer.style.heatmap.weight.value = diff.payload.value;
      }

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
