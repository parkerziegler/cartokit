import * as d3 from 'd3';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { deriveThresholds } from '$lib/interaction/scales';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer,
  DiscreteQuantitativeFill,
  QuantitativeColorInterpolator
} from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  enumerateAttributeCategories,
  selectCategoricalAttribute,
  selectQuantitativeAttribute
} from '$lib/utils/geojson';
import {
  DEFAULT_CATEGORICAL_SCHEME,
  DEFAULT_COUNT,
  DEFAULT_QUANTITATIVE_SCHEME,
  DEFAULT_THRESHOLDS
} from '$lib/utils/constants';
import type { CartoKitDiff } from '$lib/core/diff';

/**
 * Recompute the quantitative breaks for a given layer and fill style.
 *
 * @param layerId The ID of the {@link CartoKitLayer}.
 * @param fill The current {@link DiscreteQuantitativeFill} style.
 * @returns The new breaks for the given layer and fill style.
 */
function recomputeBreaks(layerId: string, fill: DiscreteQuantitativeFill) {
  const colors = d3[fill.scheme.id][fill.count];

  return deriveThresholds({
    method: fill.method,
    layerId,
    attribute: fill.attribute,
    range:
      fill.scheme.direction === 'Reverse' ? [...colors].reverse() : [...colors],
    thresholds: fill.thresholds
  });
}

const DEFAULT_QUANTITATIVE_INTERPOLATOR: QuantitativeColorInterpolator =
  'interpolatorSpectral';

/**
 * Patch fill-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchFillDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'fill-attribute': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      if (layer.style.fill.type === 'DiscreteQuantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-attribute',
          layerId: diff.layerId,
          payload: {
            attribute: layer.style.fill.attribute
          }
        };

        // Apply the patch.
        layer.style.fill.attribute = diff.payload.attribute;
        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      } else if (layer.style.fill.type === 'Categorical') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-attribute',
          layerId: diff.layerId,
          payload: {
            attribute: layer.style.fill.attribute
          }
        };

        // Apply the patch.
        layer.style.fill.attribute = diff.payload.attribute;
        layer.style.fill.categories = enumerateAttributeCategories(
          layer.data.geojson.features,
          layer.style.fill.attribute
        );
      }
      break;
    }
    case 'fill-color': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      if (layer.style.fill.type === 'Constant') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color',
          layerId: diff.layerId,
          payload: {
            color: layer.style.fill.color
          }
        };

        // Apply the patch.
        layer.style.fill.color = diff.payload.color;
      }

      break;
    }
    case 'fill-color-scheme': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'DiscreteQuantitative' ||
        layer.style.fill.type === 'Categorical'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-scheme',
          layerId: diff.layerId,
          payload: {
            scheme: layer.style.fill.scheme.id
          }
        };

        // Apply the patch.
        layer.style.fill.scheme.id = diff.payload.scheme;
      }

      break;
    }
    case 'fill-color-scheme-direction': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'DiscreteQuantitative' ||
        layer.style.fill.type === 'Categorical'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-scheme-direction',
          layerId: diff.layerId,
          payload: {
            direction: layer.style.fill.scheme.direction
          }
        };

        // Apply the patch.
        layer.style.fill.scheme.direction = diff.payload.direction;
      }

      break;
    }
    case 'fill-color-interpolator': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'ContinuousQuantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-interpolator',
          layerId: diff.layerId,
          payload: {
            interpolator: layer.style.fill.interpolator.id
          }
        };

        // Apply the patch.
        layer.style.fill.interpolator.id = diff.payload.interpolator;
      }

      break;
    }
    case 'fill-color-interpolator-direction': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'ContinuousQuantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-interpolator-direction',
          layerId: diff.layerId,
          payload: {
            direction: layer.style.fill.interpolator.direction
          }
        };

        // Apply the patch.
        layer.style.fill.interpolator.direction = diff.payload.direction;
      }

      break;
    }
    case 'fill-classification-method': {
      // add conditional logic for the continuous case here & some work needs to be done here. fillEncodingType to determine whether contin or discrete
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'DiscreteQuantitative' &&
        diff.payload.method !== 'Continuous'
      ) {
        // perhaps change this to Quantitative (rest of logic elsewhere)
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-classification-method',
          layerId: diff.layerId,
          payload: {
            method: layer.style.fill.method
          }
        };

        // Apply the patch.
        layer.style.fill.method = diff.payload.method;
        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      }

      break;
    }
    case 'fill-step-count': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'DiscreteQuantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-step-count',
          layerId: diff.layerId,
          payload: {
            count: layer.style.fill.count
          }
        };

        // Apply the patch.
        layer.style.fill.count = diff.payload.count;
        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      }

      break;
    }
    case 'fill-step-value': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'DiscreteQuantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-step-value',
          layerId: diff.layerId,
          payload: {
            step: diff.payload.step,
            value: layer.style.fill.thresholds[diff.payload.step]
          }
        };

        // Apply the patch.
        layer.style.fill.thresholds[diff.payload.step] = diff.payload.value;
        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      }

      break;
    }
    case 'fill-visualization-type': {
      // the work should be done
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'fill-visualization-type',
        layerId: diff.layerId,
        payload: {
          visualizationType: layer.style.fill.type
        }
      };

      // Apply the patch.
      switch (diff.payload.visualizationType) {
        case 'Categorical': {
          const attribute = selectCategoricalAttribute(
            layer.data.geojson.features
          );

          layer.style.fill = {
            type: diff.payload.visualizationType,
            attribute,
            categories: enumerateAttributeCategories(
              layer.data.geojson.features,
              attribute
            ),
            scheme: {
              id: DEFAULT_CATEGORICAL_SCHEME,
              direction:
                'scheme' in layer.style.fill
                  ? layer.style.fill.scheme.direction
                  : 'Forward'
            },
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
        }
        case 'DiscreteQuantitative': {
          const attribute = selectQuantitativeAttribute(
            layer.data.geojson.features
          );

          layer.style.fill = {
            type: diff.payload.visualizationType,
            attribute: attribute,
            method: 'Quantile',
            scheme: {
              id: DEFAULT_QUANTITATIVE_SCHEME,
              direction:
                layer.style.fill && 'scheme' in layer.style.fill
                  ? layer.style.fill.scheme.direction
                  : 'Forward'
            },
            count: DEFAULT_COUNT,
            thresholds: DEFAULT_THRESHOLDS(layer.id, attribute),
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
        }
        case 'ContinuousQuantitative': {
          const attribute = selectQuantitativeAttribute(
            layer.data.geojson.features
          );

          layer.style.fill = {
            type: diff.payload.visualizationType,
            attribute,
            method: 'Continuous',
            interpolator: {
              id: DEFAULT_QUANTITATIVE_INTERPOLATOR,
              direction:
                'interpolator' in layer.style.fill
                  ? layer.style.fill.interpolator.direction
                  : 'Forward'
            },
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
        }
        case 'Constant':
          layer.style.fill = {
            type: diff.payload.visualizationType,
            color: randomColor(),
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
      }

      break;
    }
    case 'fill-opacity': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'fill-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.fill.opacity
        }
      };

      // Apply the patch.
      layer.style.fill.opacity = diff.payload.opacity;

      break;
    }
    case 'add-fill': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'remove-fill',
        layerId: diff.layerId,
        payload: {}
      };

      // Apply the patch.
      layer.style.fill.visible = true;

      break;
    }
    case 'remove-fill': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitDotDensityLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'add-fill',
        layerId: diff.layerId,
        payload: {}
      };

      // Apply the patch.
      layer.style.fill.visible = false;

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
