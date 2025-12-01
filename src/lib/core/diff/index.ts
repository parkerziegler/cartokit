import type { FeatureCollection } from 'geojson';

import type {
  CartoKitLayer,
  CategoricalColorScheme,
  ClassificationMethod,
  ColorRamp,
  LayerType,
  LayerVisibility,
  QuantitativeColorScheme,
  RampDirection,
  SchemeDirection,
  TransformationCall,
  VisualizationType
} from '$lib/types';
import { patch } from '$lib/core/patch';
import { recon } from '$lib/core/recon';
import { history } from '$lib/state/history.svelte';
import { ir } from '$lib/state/ir.svelte';
import { invertDiff } from './invert';

interface BaseDiff {
  layerId: CartoKitLayer['id'];
}

interface LayerTypeDiff extends BaseDiff {
  type: 'layer-type';
  payload: {
    layerType: LayerType;
  };
}

interface FillAttributeDiff extends BaseDiff {
  type: 'fill-attribute';
  payload: {
    attribute: string;
  };
}

interface FillColorDiff extends BaseDiff {
  type: 'fill-color';
  payload: {
    color: string;
  };
}

interface FillColorSchemeDiff extends BaseDiff {
  type: 'fill-color-scheme';
  payload: {
    scheme: QuantitativeColorScheme | CategoricalColorScheme;
  };
}

interface FillColorSchemeDirectionDiff extends BaseDiff {
  type: 'fill-color-scheme-direction';
  payload: {
    direction: SchemeDirection;
  };
}

interface FillClassificationMethodDiff extends BaseDiff {
  type: 'fill-classification-method';
  payload: {
    method: ClassificationMethod;
  };
}

interface FillStepCountDiff extends BaseDiff {
  type: 'fill-step-count';
  payload: {
    count: number;
  };
}

interface FillStepValueDiff extends BaseDiff {
  type: 'fill-step-value';
  payload: {
    step: number;
    value: number;
  };
}

interface FillOpacityDiff extends BaseDiff {
  type: 'fill-opacity';
  payload: {
    opacity: number;
  };
}

interface FillVisualizationDiff extends BaseDiff {
  type: 'fill-visualization-type';
  payload: {
    visualizationType: VisualizationType;
  };
}

interface AddFillDiff extends BaseDiff {
  type: 'add-fill';
  payload: Record<string, never>;
}

interface RemoveFillDiff extends BaseDiff {
  type: 'remove-fill';
  payload: Record<string, never>;
}

interface StrokeColorDiff extends BaseDiff {
  type: 'stroke-color';
  payload: {
    color: string;
  };
}

interface StrokeWidthDiff extends BaseDiff {
  type: 'stroke-width';
  payload: {
    strokeWidth: number;
  };
}

interface StrokeOpacityDiff extends BaseDiff {
  type: 'stroke-opacity';
  payload: {
    opacity: number;
  };
}

interface AddStrokeDiff extends BaseDiff {
  type: 'add-stroke';
  payload: Record<string, never>;
}

interface RemoveStrokeDiff extends BaseDiff {
  type: 'remove-stroke';
  payload: Record<string, never>;
}

interface SizeAttributeDiff extends BaseDiff {
  type: 'size-attribute';
  payload: {
    attribute: string;
  };
}

interface SizeDiff extends BaseDiff {
  type: 'size';
  payload: {
    size: number;
  };
}

interface MinSizeDiff extends BaseDiff {
  type: 'min-size';
  payload: {
    minSize: number;
  };
}

interface MaxSizeDiff extends BaseDiff {
  type: 'max-size';
  payload: {
    maxSize: number;
  };
}

interface AddTransformationDiff extends BaseDiff {
  type: 'add-transformation';
  payload: {
    geojson: FeatureCollection;
    transformation: TransformationCall;
  };
}

interface RemoveTransformationDiff extends BaseDiff {
  type: 'remove-transformation';
  payload: {
    geojson: FeatureCollection;
    transformationName: string;
  };
}

interface HeatmapOpacityDiff extends BaseDiff {
  type: 'heatmap-opacity';
  payload: {
    opacity: number;
  };
}

interface HeatmapRadiusDiff extends BaseDiff {
  type: 'heatmap-radius';
  payload: {
    radius: number;
  };
}

interface HeatmapRampDiff extends BaseDiff {
  type: 'heatmap-ramp';
  payload: {
    ramp: ColorRamp;
  };
}

interface HeatmapRampDirectionDiff extends BaseDiff {
  type: 'heatmap-ramp-direction';
  payload: {
    direction: RampDirection;
  };
}

interface HeatmapWeightTypeDiff extends BaseDiff {
  type: 'heatmap-weight-type';
  payload: {
    weightType: 'Constant' | 'Quantitative';
  };
}

interface HeatmapWeightAttributeDiff extends BaseDiff {
  type: 'heatmap-weight-attribute';
  payload: {
    weightAttribute: string;
  };
}

interface HeatmapWeightMinDiff extends BaseDiff {
  type: 'heatmap-weight-min';
  payload: {
    min: number;
  };
}

interface HeatmapWeightMaxDiff extends BaseDiff {
  type: 'heatmap-weight-max';
  payload: {
    max: number;
  };
}

interface HeatmapWeightValueDiff extends BaseDiff {
  type: 'heatmap-weight-value';
  payload: {
    value: number;
  };
}

interface LayerVisibilityDiff extends BaseDiff {
  type: 'layer-visibility';
  payload: {
    visibility: LayerVisibility;
  };
}

interface LayerTooltipVisibilityDiff extends BaseDiff {
  type: 'layer-tooltip-visibility';
  payload: {
    visible: boolean;
  };
}

interface RemoveLayerDiff extends BaseDiff {
  type: 'remove-layer';
  payload: Record<string, never>;
}

interface RenameLayerDiff extends BaseDiff {
  type: 'rename-layer';
  payload: {
    displayName: string;
  };
}

export type CartoKitDiff =
  | LayerTypeDiff
  | AddTransformationDiff
  | RemoveTransformationDiff
  | FillAttributeDiff
  | FillColorDiff
  | FillColorSchemeDiff
  | FillColorSchemeDirectionDiff
  | FillClassificationMethodDiff
  | FillStepCountDiff
  | FillStepValueDiff
  | FillVisualizationDiff
  | FillOpacityDiff
  | AddFillDiff
  | RemoveFillDiff
  | StrokeColorDiff
  | StrokeWidthDiff
  | StrokeOpacityDiff
  | AddStrokeDiff
  | RemoveStrokeDiff
  | SizeAttributeDiff
  | SizeDiff
  | MinSizeDiff
  | MaxSizeDiff
  | HeatmapOpacityDiff
  | HeatmapRadiusDiff
  | HeatmapRampDiff
  | HeatmapRampDirectionDiff
  | HeatmapWeightTypeDiff
  | HeatmapWeightAttributeDiff
  | HeatmapWeightMinDiff
  | HeatmapWeightMaxDiff
  | HeatmapWeightValueDiff
  | LayerVisibilityDiff
  | LayerTooltipVisibilityDiff
  | RemoveLayerDiff
  | RenameLayerDiff;

export function applyDiff(
  execute: CartoKitDiff,
  triggeredByUndo = false
): void {
  const sourceIR = ir.value;

  // Derive the inverse diff from the execute diff.
  const invert = invertDiff(execute, sourceIR);

  // Patch the source IR to get the target IR.
  const targetIR = patch(execute, sourceIR);

  // Reconcile the map to the target IR.
  recon(execute, sourceIR, targetIR);

  // If the diff was triggered by undo, push the diff to the redo stack.
  // All normally applied diffs are pushed to the undo stack.
  if (triggeredByUndo) {
    history.redo.push({
      execute: invert,
      invert: execute
    });
  } else {
    history.undo.push({
      execute,
      invert
    });
  }

  ir.value = targetIR;
}
