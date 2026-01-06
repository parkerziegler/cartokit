import type { FeatureCollection } from 'geojson';

import { invertDiff } from '$lib/core/diff/invert';
import { patch } from '$lib/core/patch';
import { recon } from '$lib/core/recon';
import { diffs } from '$lib/state/diffs.svelte';
import { history } from '$lib/state/history.svelte';
import { user } from '$lib/state/user.svelte';
import { ir } from '$lib/stores/ir';
import type {
  BasemapProvider,
  CartoKitLayer,
  CategoricalColorScheme,
  ClassificationMethod,
  ColorRamp,
  LayerType,
  Projection,
  QuantitativeColorScheme,
  RampDirection,
  SchemeDirection,
  TransformationCall,
  VisualizationType
} from '$lib/types';
import { get } from 'svelte/store';

interface LayerDiff {
  layerId: CartoKitLayer['id'];
}

interface LayerTypeDiff extends LayerDiff {
  type: 'layer-type';
  payload: {
    layerType: LayerType;
  };
}

interface FillAttributeDiff extends LayerDiff {
  type: 'fill-attribute';
  payload: {
    attribute: string;
  };
}

interface FillColorDiff extends LayerDiff {
  type: 'fill-color';
  payload: {
    color: string;
  };
}

interface FillColorSchemeDiff extends LayerDiff {
  type: 'fill-color-scheme';
  payload: {
    scheme: QuantitativeColorScheme | CategoricalColorScheme;
  };
}

interface FillColorSchemeDirectionDiff extends LayerDiff {
  type: 'fill-color-scheme-direction';
  payload: {
    direction: SchemeDirection;
  };
}

interface FillClassificationMethodDiff extends LayerDiff {
  type: 'fill-classification-method';
  payload: {
    method: ClassificationMethod;
  };
}

interface FillStepCountDiff extends LayerDiff {
  type: 'fill-step-count';
  payload: {
    count: number;
  };
}

interface FillStepValueDiff extends LayerDiff {
  type: 'fill-step-value';
  payload: {
    step: number;
    value: number;
  };
}

interface FillOpacityDiff extends LayerDiff {
  type: 'fill-opacity';
  payload: {
    opacity: number;
  };
}

interface FillVisualizationDiff extends LayerDiff {
  type: 'fill-visualization-type';
  payload: {
    visualizationType: VisualizationType;
  };
}

interface AddFillDiff extends LayerDiff {
  type: 'add-fill';
  payload: Record<string, never>;
}

interface RemoveFillDiff extends LayerDiff {
  type: 'remove-fill';
  payload: Record<string, never>;
}

interface StrokeColorDiff extends LayerDiff {
  type: 'stroke-color';
  payload: {
    color: string;
  };
}

interface StrokeWidthDiff extends LayerDiff {
  type: 'stroke-width';
  payload: {
    strokeWidth: number;
  };
}

interface StrokeOpacityDiff extends LayerDiff {
  type: 'stroke-opacity';
  payload: {
    opacity: number;
  };
}

interface AddStrokeDiff extends LayerDiff {
  type: 'add-stroke';
  payload: Record<string, never>;
}

interface RemoveStrokeDiff extends LayerDiff {
  type: 'remove-stroke';
  payload: Record<string, never>;
}

interface SizeAttributeDiff extends LayerDiff {
  type: 'size-attribute';
  payload: {
    attribute: string;
  };
}

interface SizeDiff extends LayerDiff {
  type: 'size';
  payload: {
    size: number;
  };
}

interface MinSizeDiff extends LayerDiff {
  type: 'min-size';
  payload: {
    minSize: number;
  };
}

interface MaxSizeDiff extends LayerDiff {
  type: 'max-size';
  payload: {
    maxSize: number;
  };
}

interface DotValueDiff extends LayerDiff {
  type: 'dot-value';
  payload: {
    value: number;
  };
}

interface DotAttributeDiff extends LayerDiff {
  type: 'dot-attribute';
  payload: {
    attribute: string;
  };
}

interface HeatmapOpacityDiff extends LayerDiff {
  type: 'heatmap-opacity';
  payload: {
    opacity: number;
  };
}

interface HeatmapRadiusDiff extends LayerDiff {
  type: 'heatmap-radius';
  payload: {
    radius: number;
  };
}

interface HeatmapRampDiff extends LayerDiff {
  type: 'heatmap-ramp';
  payload: {
    ramp: ColorRamp;
  };
}

interface HeatmapRampDirectionDiff extends LayerDiff {
  type: 'heatmap-ramp-direction';
  payload: {
    direction: RampDirection;
  };
}

interface HeatmapWeightTypeDiff extends LayerDiff {
  type: 'heatmap-weight-type';
  payload: {
    weightType: 'Constant' | 'Quantitative';
  };
}

interface HeatmapWeightAttributeDiff extends LayerDiff {
  type: 'heatmap-weight-attribute';
  payload: {
    weightAttribute: string;
  };
}

interface HeatmapWeightMinDiff extends LayerDiff {
  type: 'heatmap-weight-min';
  payload: {
    min: number;
  };
}

interface HeatmapWeightMaxDiff extends LayerDiff {
  type: 'heatmap-weight-max';
  payload: {
    max: number;
  };
}

interface HeatmapWeightValueDiff extends LayerDiff {
  type: 'heatmap-weight-value';
  payload: {
    value: number;
  };
}

interface AddTransformationDiff extends LayerDiff {
  type: 'add-transformation';
  payload: {
    geojson: FeatureCollection;
    transformation: TransformationCall;
  };
}

interface RemoveTransformationDiff extends LayerDiff {
  type: 'remove-transformation';
  payload: {
    geojson: FeatureCollection;
    transformationName: string;
  };
}

interface LayerVisibilityDiff extends LayerDiff {
  type: 'layer-visibility';
  payload: {
    visible: boolean;
  };
}

interface LayerTooltipVisibilityDiff extends LayerDiff {
  type: 'layer-tooltip-visibility';
  payload: {
    visible: boolean;
  };
}

interface AddLayerDiff extends LayerDiff {
  type: 'add-layer';
  payload:
    | { type: 'api'; displayName: string; url: string }
    | {
        type: 'file';
        displayName: string;
        fileName: string;
        featureCollection: FeatureCollection;
      };
}

interface RemoveLayerDiff extends LayerDiff {
  type: 'remove-layer';
  payload: Record<string, never>;
}

interface RenameLayerDiff extends LayerDiff {
  type: 'rename-layer';
  payload: {
    displayName: string;
  };
}

interface BasemapDiff {
  type: 'basemap';
  payload: {
    url: string;
    provider: BasemapProvider;
  };
}

interface ZoomDiff {
  type: 'zoom';
  payload: {
    zoom: number;
  };
}

interface CenterDiff {
  type: 'center';
  payload: {
    center: {
      lng: number;
      lat: number;
    };
  };
}

interface ProjectionDiff {
  type: 'projection';
  payload: {
    projection: Projection;
  };
}

export type CartoKitDiff =
  | LayerTypeDiff
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
  | DotValueDiff
  | DotAttributeDiff
  | HeatmapOpacityDiff
  | HeatmapRadiusDiff
  | HeatmapRampDiff
  | HeatmapRampDirectionDiff
  | HeatmapWeightTypeDiff
  | HeatmapWeightAttributeDiff
  | HeatmapWeightMinDiff
  | HeatmapWeightMaxDiff
  | HeatmapWeightValueDiff
  | AddTransformationDiff
  | RemoveTransformationDiff
  | LayerVisibilityDiff
  | LayerTooltipVisibilityDiff
  | AddLayerDiff
  | RemoveLayerDiff
  | RenameLayerDiff
  | BasemapDiff
  | ZoomDiff
  | CenterDiff
  | ProjectionDiff;

export async function applyDiff(
  execute: CartoKitDiff,
  triggeredByUndo = false
): Promise<void> {
  const sourceIR = get(ir);

  // Derive the inverse diff from the execute diff.
  const invert = invertDiff(execute, sourceIR);

  // Patch the source IR to get the target IR.
  const targetIR = await patch(execute, sourceIR);

  // Reconcile the map to the target IR.
  await recon(execute, sourceIR, targetIR);

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

  ir.set(targetIR);

  // Track diffs for user study.
  if (user.userId) {
    diffs.push(execute);
  }
}
