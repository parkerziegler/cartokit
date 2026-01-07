import * as d3 from 'd3';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { deriveThresholds } from '$lib/interaction/scales';
import type {
  CartoKitChoroplethLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer,
  CategoricalFill,
  ConstantFill,
  QuantitativeFill
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

/**
 * Recompute the quantitative breaks for a given layer and fill style.
 *
 * @param layerId The ID of the {@link CartoKitLayer}.
 * @param fill The current {@link QuantitativeFill} style.
 * @returns The new breaks for the given layer and fill style.
 */
function recomputeBreaks(layerId: string, fill: QuantitativeFill) {
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
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'fill-attribute': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      if (layer.style.fill.type === 'Quantitative') {
        layer.style.fill.attribute = diff.payload.attribute;

        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      } else if (layer.style.fill.type === 'Categorical') {
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
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      if (layer.style.fill.type === 'Constant') {
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
        layer.style.fill.type === 'Quantitative' ||
        layer.style.fill.type === 'Categorical'
      ) {
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
        layer.style.fill.type === 'Quantitative' ||
        layer.style.fill.type === 'Categorical'
      ) {
        layer.style.fill.scheme.direction = diff.payload.direction;
      }

      break;
    }
    case 'fill-classification-method': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      if (layer.style.fill.type === 'Quantitative') {
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

      if (layer.style.fill.type === 'Quantitative') {
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

      if (layer.style.fill.type === 'Quantitative') {
        layer.style.fill.thresholds[diff.payload.step] = diff.payload.value;

        layer.style.fill.thresholds = recomputeBreaks(
          layer.id,
          layer.style.fill
        );
      }

      break;
    }
    case 'fill-visualization-type': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitProportionalSymbolLayer;

      let fill: QuantitativeFill | CategoricalFill | ConstantFill;

      switch (diff.payload.visualizationType) {
        case 'Categorical': {
          const attribute = selectCategoricalAttribute(
            layer.data.geojson.features
          );

          fill = {
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
        case 'Quantitative': {
          const attribute = selectQuantitativeAttribute(
            layer.data.geojson.features
          );

          fill = {
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
        case 'Constant':
          fill = {
            type: diff.payload.visualizationType,
            color: randomColor(),
            opacity: layer.style.fill.opacity,
            visible: layer.style.fill.visible
          };
          break;
      }

      layer.style.fill = fill;

      break;
    }
    case 'fill-opacity': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      layer.style.fill.opacity = diff.payload.opacity;

      break;
    }
    case 'add-fill': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      layer.style.fill.visible = true;

      break;
    }
    case 'remove-fill': {
      const layer = ir.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      layer.style.fill.visible = false;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
