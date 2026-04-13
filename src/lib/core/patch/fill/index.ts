import * as d3 from 'd3';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { deriveThresholds } from '$lib/interaction/scales';
import type {
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer,
  QuantitativeColorScale,
  ContinuousColorScale,
  CategoricalColorScale
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
  DEFAULT_METHOD,
  DEFAULT_QUANTITATIVE_SCHEME,
  DEFAULT_SCHEME_DIRECTION,
  DEFAULT_THRESHOLDS
} from '$lib/utils/constants';
import type { CartoKitDiff } from '$lib/core/diff';
import {
  convertRampToScheme,
  convertSchemeToRamp
} from '$lib/utils/color/converter';
import { materializeColorScheme } from '$lib/utils/color/scheme';

/**
 * Recompute the quantitative breaks for a given layer and fill style.
 *
 * @param layerId The ID of the {@link CartoKitLayer}.
 * @param fill The current {@link QuantitativeFill} style.
 * @returns The new breaks for the given layer and fill style.
 */
function recomputeBreaks(
  layerId: string,
  attribute: string,
  scale: Exclude<QuantitativeColorScale, ContinuousColorScale>
) {
  const colors = d3[scale.scheme.id][scale.steps];

  return deriveThresholds({
    method: scale.type,
    layerId,
    attribute,
    range:
      scale.scheme.direction === 'Reverse'
        ? [...colors].reverse()
        : [...colors],
    thresholds: scale.thresholds
  });
}

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

      if (layer.style.fill.type === 'Quantitative') {
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

        if (layer.style.fill.scale.type === 'Continuous') {
          // TODO: Consider what we'll need to do for continuous color scales.
          // My hunch is that we may not need to do anything; the catalog should
          // already contain min and max values that we can use to derive the
          // color scale in deriveColorScale.
        } else {
          layer.style.fill.scale.thresholds = recomputeBreaks(
            layer.id,
            layer.style.fill.attribute,
            layer.style.fill.scale
          );
        }
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
        layer.style.fill.scale.categories = enumerateAttributeCategories(
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
    case 'fill-color-ramp': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'Quantitative' &&
        layer.style.fill.scale.type === 'Continuous'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-ramp',
          layerId: diff.layerId,
          payload: {
            ramp: layer.style.fill.scale.interpolator.id
          }
        };

        // Apply the patch.
        layer.style.fill.scale.interpolator.id = diff.payload.ramp;
      }

      break;
    }
    case 'fill-color-ramp-direction': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'Quantitative' &&
        layer.style.fill.scale.type === 'Continuous'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-ramp-direction',
          layerId: diff.layerId,
          payload: {
            direction: layer.style.fill.scale.interpolator.direction
          }
        };

        // Apply the patch.
        layer.style.fill.scale.interpolator.direction = diff.payload.direction;
      }

      break;
    }
    case 'fill-color-scheme': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        (layer.style.fill.type === 'Quantitative' &&
          layer.style.fill.scale.type !== 'Continuous') ||
        layer.style.fill.type === 'Categorical'
      ) {
        const currentScale = layer.style.fill.scale as
          | Exclude<QuantitativeColorScale, ContinuousColorScale>
          | CategoricalColorScale;

        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-scheme',
          layerId: diff.layerId,
          payload: {
            scheme: currentScale.scheme.id
          }
        };

        // Apply the patch.
        currentScale.scheme.id = diff.payload.scheme;
      }

      break;
    }
    case 'fill-color-scheme-direction': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'Quantitative' ||
        layer.style.fill.type === 'Categorical'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-color-scheme-direction',
          layerId: diff.layerId,
          payload: {
            direction: (
              layer.style.fill.scale as
                | Exclude<QuantitativeColorScale, ContinuousColorScale>
                | CategoricalColorScale
            ).scheme.direction
          }
        };

        // Apply the patch.
        (
          layer.style.fill.scale as
            | Exclude<QuantitativeColorScale, ContinuousColorScale>
            | CategoricalColorScale
        ).scheme.direction = diff.payload.direction;
      }

      break;
    }
    case 'fill-classification-method': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'Quantitative') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-classification-method',
          layerId: diff.layerId,
          payload: {
            method: layer.style.fill.scale.type
          }
        };

        // If transitioning from a discrete to a continuous color scale or vice
        // versa, build the color scale wholesale.
        if (
          diff.payload.method === 'Continuous' &&
          layer.style.fill.scale.type !== 'Continuous'
        ) {
          layer.style.fill.scale = {
            type: diff.payload.method,
            interpolator: {
              id: convertSchemeToRamp(layer.style.fill.scale.scheme.id),
              direction: layer.style.fill.scale.scheme.direction
            }
          };
        } else if (
          diff.payload.method !== 'Continuous' &&
          layer.style.fill.scale.type === 'Continuous'
        ) {
          const scheme = {
            id: convertRampToScheme(layer.style.fill.scale.interpolator.id),
            direction: layer.style.fill.scale.interpolator.direction
          };

          const range = materializeColorScheme(
            scheme.id,
            scheme.direction,
            DEFAULT_COUNT
          );

          layer.style.fill.scale = {
            type: diff.payload.method,
            scheme,
            steps: DEFAULT_COUNT,
            thresholds: deriveThresholds({
              method: diff.payload.method,
              layerId: layer.id,
              attribute: layer.style.fill.attribute,
              range,
              thresholds: DEFAULT_THRESHOLDS(
                layer.id,
                layer.style.fill.attribute
              )
            })
          };
        } else if (
          diff.payload.method !== 'Continuous' &&
          layer.style.fill.scale.type !== 'Continuous'
        ) {
          // Just recompute the thresholds.
          layer.style.fill.scale.type = diff.payload.method;
          layer.style.fill.scale.thresholds = recomputeBreaks(
            layer.id,
            layer.style.fill.attribute,
            layer.style.fill.scale
          );
        }
      }

      break;
    }
    case 'fill-step-count': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'Quantitative' &&
        layer.style.fill.scale.type !== 'Continuous'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-step-count',
          layerId: diff.layerId,
          payload: {
            count: layer.style.fill.scale.steps
          }
        };

        // Apply the patch.
        layer.style.fill.scale.steps = diff.payload.count;
        layer.style.fill.scale.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill.attribute,
          layer.style.fill.scale
        );
      }

      break;
    }
    case 'fill-step-value': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (
        layer.style.fill.type === 'Quantitative' &&
        layer.style.fill.scale.type === 'Manual'
      ) {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'fill-step-value',
          layerId: diff.layerId,
          payload: {
            step: diff.payload.step,
            value: layer.style.fill.scale.thresholds[diff.payload.step]
          }
        };

        // Apply the patch.
        layer.style.fill.scale.thresholds[diff.payload.step] =
          diff.payload.value;
        layer.style.fill.scale.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill.attribute,
          layer.style.fill.scale
        );
      }

      break;
    }
    case 'fill-visualization-type': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
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
            scale: {
              type: 'Categorical',
              scheme: {
                id: DEFAULT_CATEGORICAL_SCHEME,
                direction: 'Forward'
              },
              categories: enumerateAttributeCategories(
                layer.data.geojson.features,
                attribute
              )
            },
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
        }
        case 'Quantitative': {
          const attribute = selectQuantitativeAttribute(
            layer.data.geojson.features
          );

          layer.style.fill = {
            type: diff.payload.visualizationType,
            attribute: attribute,
            scale: {
              type: DEFAULT_METHOD,
              scheme: {
                id: DEFAULT_QUANTITATIVE_SCHEME,
                direction: DEFAULT_SCHEME_DIRECTION
              },
              steps: DEFAULT_COUNT,
              thresholds: DEFAULT_THRESHOLDS(layer.id, attribute)
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
