import type {
  CartoKitIR,
  VisualizationType,
  ConstantFill,
  CategoricalFill,
  QuantitativeFill,
  CartoKitChoroplethLayer,
  CartoKitPointLayer,
  CartoKitPolygonLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitLayer,
  CartoKitLineLayer,
  CartoKitHeatmapLayer,
  QuantitativeHeatmapWeight,
  ConstantHeatmapWeight
} from '$lib/types';
import type { CartoKitDiff } from '$lib/core/diff';

export function invertDiff(
  diff: CartoKitDiff,
  sourceIR: CartoKitIR
): CartoKitDiff {
  switch (diff.type) {
    case 'layer-type': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;
      return {
        type: 'layer-type',
        layerId: diff.layerId,
        payload: {
          layerType: layer.type
        }
      };
    }
    case 'fill-attribute': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-attribute',
        layerId: diff.layerId,
        payload: {
          attribute: (layer.style.fill as QuantitativeFill | CategoricalFill)
            .attribute
        }
      };
    }
    case 'fill-color': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      return {
        type: 'fill-color',
        layerId: diff.layerId,
        payload: {
          color: (layer.style.fill as ConstantFill).color
        }
      };
    }
    case 'fill-color-scheme': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-color-scheme',
        layerId: diff.layerId,
        payload: {
          scheme: (layer.style.fill as QuantitativeFill | CategoricalFill)
            .scheme.id
        }
      };
    }
    case 'fill-color-scheme-direction': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-color-scheme-direction',
        layerId: diff.layerId,
        payload: {
          direction: (layer.style.fill as QuantitativeFill | CategoricalFill)
            .scheme.direction
        }
      };
    }
    case 'fill-classification-method': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-classification-method',
        layerId: diff.layerId,
        payload: {
          method: (layer.style.fill as QuantitativeFill).method
        }
      };
    }
    case 'fill-step-count': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-step-count',
        layerId: diff.layerId,
        payload: {
          count: (layer.style.fill as QuantitativeFill).count
        }
      };
    }
    case 'fill-step-value': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-step-value',
        layerId: diff.layerId,
        payload: {
          step: diff.payload.step,
          value: (layer.style.fill as QuantitativeFill).thresholds[
            diff.payload.step
          ]
        }
      };
    }
    case 'fill-visualization-type': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'fill-visualization-type',
        layerId: diff.layerId,
        payload: {
          visualizationType: (
            layer.style.fill as
              | QuantitativeFill
              | CategoricalFill
              | ConstantFill
          ).type as VisualizationType
        }
      };
    }
    case 'fill-opacity': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitPointLayer
        | CartoKitProportionalSymbolLayer
        | CartoKitPolygonLayer;

      return {
        type: 'fill-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.fill.opacity
        }
      };
    }
    case 'add-fill': {
      return {
        type: 'remove-fill',
        layerId: diff.layerId,
        payload: {}
      };
    }
    case 'remove-fill': {
      return {
        type: 'add-fill',
        layerId: diff.layerId,
        payload: {}
      };
    }
    case 'stroke-color': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'stroke-color',
        layerId: diff.layerId,
        payload: {
          color: layer.style.stroke.color
        }
      };
    }
    case 'stroke-width': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'stroke-width',
        layerId: diff.layerId,
        payload: {
          strokeWidth: layer.style.stroke.width
        }
      };
    }
    case 'stroke-opacity': {
      const layer = sourceIR.layers[diff.layerId] as
        | CartoKitChoroplethLayer
        | CartoKitLineLayer
        | CartoKitPointLayer
        | CartoKitPolygonLayer
        | CartoKitProportionalSymbolLayer;

      return {
        type: 'stroke-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.stroke.opacity
        }
      };
    }
    case 'add-stroke': {
      return {
        type: 'remove-stroke',
        layerId: diff.layerId,
        payload: {}
      };
    }
    case 'remove-stroke': {
      return {
        type: 'add-stroke',
        layerId: diff.layerId,
        payload: {}
      };
    }
    case 'size-attribute': {
      const layer = sourceIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      return {
        type: 'size-attribute',
        layerId: diff.layerId,
        payload: {
          attribute: layer.style.size.attribute
        }
      };
    }
    case 'size': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitPointLayer;

      return {
        type: 'size',
        layerId: diff.layerId,
        payload: {
          size: layer.style.size
        }
      };
    }

    case 'min-size': {
      const layer = sourceIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      return {
        type: 'min-size',
        layerId: diff.layerId,
        payload: {
          minSize: layer.style.size.min
        }
      };
    }

    case 'max-size': {
      const layer = sourceIR.layers[
        diff.layerId
      ] as CartoKitProportionalSymbolLayer;

      return {
        type: 'max-size',
        layerId: diff.layerId,
        payload: {
          maxSize: layer.style.size.max
        }
      };
    }
    case 'add-transformation': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;

      const transformationName = diff.payload.transformation.name;

      return {
        type: 'remove-transformation',
        layerId: diff.layerId,
        payload: {
          geojson: layer.data.geojson,
          transformationName: transformationName
        }
      };
    }
    case 'remove-transformation': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;
      const transformationName = diff.payload.transformationName;

      const transformation = layer.data.transformations.find(
        (t) => t.name === transformationName
      );

      if (!transformation) {
        throw new Error(
          `Transformation ${transformationName} not found in layer`
        );
      }

      return {
        type: 'add-transformation',
        layerId: diff.layerId,
        payload: {
          geojson: layer.data.geojson,
          transformation: transformation
        }
      };
    }
    case 'heatmap-opacity': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-opacity',
        layerId: diff.layerId,
        payload: {
          opacity: layer.style.heatmap.opacity
        }
      };
    }

    case 'heatmap-radius': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-radius',
        layerId: diff.layerId,
        payload: {
          radius: layer.style.heatmap.radius
        }
      };
    }

    case 'heatmap-ramp': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-ramp',
        layerId: diff.layerId,
        payload: {
          ramp: layer.style.heatmap.ramp.id
        }
      };
    }

    case 'heatmap-ramp-direction': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-ramp-direction',
        layerId: diff.layerId,
        payload: {
          direction: layer.style.heatmap.ramp.direction
        }
      };
    }

    case 'heatmap-weight-type': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-weight-type',
        layerId: diff.layerId,
        payload: {
          weightType: layer.style.heatmap.weight.type
        }
      };
    }

    case 'heatmap-weight-attribute': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-weight-attribute',
        layerId: diff.layerId,
        payload: {
          weightAttribute: (
            layer.style.heatmap.weight as QuantitativeHeatmapWeight
          ).attribute
        }
      };
    }

    case 'heatmap-weight-min': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-weight-min',
        layerId: diff.layerId,
        payload: {
          min: (layer.style.heatmap.weight as QuantitativeHeatmapWeight).min
        }
      };
    }
    case 'heatmap-weight-max': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-weight-max',
        layerId: diff.layerId,
        payload: {
          max: (layer.style.heatmap.weight as QuantitativeHeatmapWeight).max
        }
      };
    }
    case 'heatmap-weight-value': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitHeatmapLayer;

      return {
        type: 'heatmap-weight-value',
        layerId: diff.layerId,
        payload: {
          value: (layer.style.heatmap.weight as ConstantHeatmapWeight).value
        }
      };
    }

    case 'layer-visibility': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;

      return {
        type: 'layer-visibility',
        layerId: diff.layerId,
        payload: {
          visibility: layer.layout.visibility
        }
      };
    }
    case 'layer-tooltip-visibility': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;

      return {
        type: 'layer-tooltip-visibility',
        layerId: diff.layerId,
        payload: {
          visible: layer.layout.tooltip.visible
        }
      };
    }
    case 'add-layer': {
      return {
        type: 'remove-layer',
        layerId: diff.layerId,
        payload: {}
      };
    }
    case 'remove-layer': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;

      return {
        type: 'add-layer',
        layerId: diff.layerId,
        payload: layer.data.url
          ? {
              type: 'api',
              displayName: layer.displayName,
              url: layer.data.url
            }
          : {
              type: 'file',
              displayName: layer.displayName,
              fileName: layer.data.fileName!,
              featureCollection: layer.data.geojson
            }
      };
    }
    case 'rename-layer': {
      const layer = sourceIR.layers[diff.layerId] as CartoKitLayer;

      return {
        type: 'rename-layer',
        layerId: diff.layerId,
        payload: {
          displayName: layer.displayName
        }
      };
    }
  }
}
