import * as Comlink from 'comlink';
import type { FeatureCollection } from 'geojson';
import { get } from 'svelte/store';

import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { ir } from '$lib/stores/ir';
import type { CartoKitLayer, CartoKitSource } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_SIZE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

interface GenerateCartoKitLayerOptions {
  layerId: string;
  displayName: string;
}

/**
 * Generate a {@link CartoKitLayer} for a given {@link CartoKitSource}, dis-
 * patching on the source's type to the appropriate source-specific generator.
 *
 * @param source The {@link CartoKitSource} associated with the layer.
 * @param options The options for the {@link CartoKitLayer}.
 * @param options.layerId The ID of the {@link CartoKitLayer}.
 * @param options.displayName The display name of the {@link CartoKitLayer}.
 * @returns A default {@link CartoKitLayer} appropriate for the input source.
 */
function generateCartoKitLayer(
  source: CartoKitSource,
  options: GenerateCartoKitLayerOptions
): CartoKitLayer {
  switch (source.type) {
    case 'geojson':
      return generateCartoKitLayerFromGeoJSON(source, options);
    case 'vector':
      return generateCartoKitLayerFromVectorTiles(source, options);
  }
}

/**
 * Generate a {@link CartoKitLayer} for a GeoJSON-backed source, using the
 * source's geometry type to select the appropriate member of the
 * {@link CartoKitLayer} union.
 *
 * @param source The GeoJSON {@link CartoKitSource} associated with the layer.
 * @param options The options for the {@link CartoKitLayer}.
 * @returns A default {@link CartoKitLayer} appropriate for the input geometry
 * type.
 */
function generateCartoKitLayerFromGeoJSON(
  source: Extract<CartoKitSource, { type: 'geojson' }>,
  options: GenerateCartoKitLayerOptions
): CartoKitLayer {
  const geometryType = getFeatureCollectionGeometryType(source.data);
  const color = randomColor();
  const z = Object.values(get(ir).layers).length;

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: options.layerId,
        displayName: options.displayName,
        type: 'Point',
        source,
        style: {
          size: DEFAULT_SIZE,
          fill: {
            type: 'Constant',
            color,
            opacity: DEFAULT_OPACITY,
            visible: true
          },
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'LineString':
    case 'MultiLineString':
      return {
        id: options.layerId,
        displayName: options.displayName,
        type: 'Line',
        source,
        style: {
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        id: options.layerId,
        displayName: options.displayName,
        type: 'Polygon',
        source,
        style: {
          fill: {
            type: 'Constant',
            color,
            opacity: DEFAULT_OPACITY,
            visible: true
          },
          stroke: {
            type: 'Constant',
            color,
            width: DEFAULT_STROKE_WIDTH,
            opacity: DEFAULT_STROKE_OPACITY,
            visible: true
          }
        },
        layout: {
          visible: true,
          z,
          tooltip: {
            visible: true
          }
        }
      };
    case 'GeometryCollection':
      throw new Error('GeometryCollection not supported.');
  }
}

/**
 * Generate a {@link CartoKitLayer} for a vector tile source.
 *
 * TODO: This is a stub. A complete implementation will need to inspect the
 * source layers advertised by the vector tile endpoint (via its TileJSON or
 * equivalent metadata) to discern the appropriate geometry type, source layer
 * name, and default styling. For now, we default to a Polygon layer.
 *
 * @param source The vector tile {@link CartoKitSource} associated with the
 * layer.
 * @param options The options for the {@link CartoKitLayer}.
 * @returns A default {@link CartoKitLayer} for the vector tile source.
 */
function generateCartoKitLayerFromVectorTiles(
  source: Extract<CartoKitSource, { type: 'vector' }>,
  options: GenerateCartoKitLayerOptions
): CartoKitLayer {
  const color = randomColor();
  const z = Object.values(get(ir).layers).length;

  return {
    id: options.layerId,
    displayName: options.displayName,
    type: 'Polygon',
    source,
    style: {
      fill: {
        type: 'Constant',
        color,
        opacity: DEFAULT_OPACITY,
        visible: true
      },
      stroke: {
        type: 'Constant',
        color,
        width: DEFAULT_STROKE_WIDTH,
        opacity: DEFAULT_STROKE_OPACITY,
        visible: true
      }
    },
    layout: {
      visible: true,
      z,
      tooltip: {
        visible: true
      }
    }
  };
}

/**
 * Patch layer-related {@link CartoKitDiff}s for the current {@link CartoKitIR}.
 *
 * @param params A promise that resolves to the {@link PatchFnParams}, including
 * the current {@link CartoKitDiff} and {@link CartoKitIR}.
 * @returns A promise that resolves to the {@link PatchFnResult}, including
 * the current {@link CartoKitDiff} and patched {@link CartoKitIR}.
 */
export async function patchLayerDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir, inverseDiff } = await params;

  let inverse: CartoKitDiff = inverseDiff;

  switch (diff.type) {
    case 'add-layer': {
      let layer: CartoKitLayer;

      if (diff.payload.type === 'vector') {
        layer = generateCartoKitLayer(
          {
            type: 'vector',
            location: diff.payload.location
          },
          {
            layerId: diff.layerId,
            displayName: diff.payload.displayName
          }
        );

        // Derive the inverse diff after creating the layer.
        inverse = {
          type: 'remove-layer',
          layerId: diff.layerId,
          payload: {
            sourceLayerType: layer.type
          }
        };

        // Apply the patch.
        ir.layers[diff.layerId] = layer;
      } else if (
        diff.payload.type === 'geojson' &&
        diff.payload.location.type === 'api'
      ) {
        // Fetch the GeoJSON data in a worker thread.
        const sourceWorker = new Worker(
          new URL('$lib/utils/source/worker.ts', import.meta.url),
          { type: 'module' }
        );
        const fetchGeoJSON =
          Comlink.wrap<(url: string) => Promise<FeatureCollection>>(
            sourceWorker
          );

        const featureCollection = await fetchGeoJSON(diff.payload.location.url);
        layer = generateCartoKitLayer(
          {
            type: 'geojson',
            location: diff.payload.location,
            data: featureCollection,
            sourceData: featureCollection,
            transformations: []
          },
          {
            layerId: diff.layerId,
            displayName: diff.payload.displayName
          }
        );

        // Derive the inverse diff after creating the layer.
        inverse = {
          type: 'remove-layer',
          layerId: diff.layerId,
          payload: {
            sourceLayerType: layer.type
          }
        };

        // Apply the patch.
        ir.layers[diff.layerId] = layer;
      } else if (
        diff.payload.type === 'geojson' &&
        diff.payload.location.type === 'file'
      ) {
        layer = generateCartoKitLayer(
          {
            type: 'geojson',
            location: diff.payload.location,
            data: diff.payload.location.featureCollection,
            sourceData: diff.payload.location.featureCollection,
            transformations: []
          },
          {
            layerId: diff.layerId,
            displayName: diff.payload.displayName
          }
        );

        // Derive the inverse diff after creating the layer.
        inverse = {
          type: 'remove-layer',
          layerId: diff.layerId,
          payload: {
            sourceLayerType: layer.type
          }
        };

        // Apply the patch.
        ir.layers[diff.layerId] = layer;
      }

      break;
    }
    case 'layer-visibility': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'layer-visibility',
        layerId: diff.layerId,
        payload: {
          visible: layer.layout.visible
        }
      };

      // Apply the patch.
      layer.layout.visible = diff.payload.visible;

      break;
    }
    case 'layer-tooltip-visibility': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'layer-tooltip-visibility',
        layerId: diff.layerId,
        payload: {
          visible: layer.layout.tooltip.visible
        }
      };

      // Apply the patch.
      layer.layout.tooltip.visible = diff.payload.visible;

      break;
    }
    case 'remove-layer': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      if (layer.source.type === 'vector') {
        inverse = {
          type: 'add-layer',
          layerId: diff.layerId,
          payload: {
            type: 'vector',
            displayName: layer.displayName,
            location: layer.source.location
          }
        };
      } else if (
        layer.source.type === 'geojson' &&
        layer.source.location.type === 'api'
      ) {
        inverse = {
          type: 'add-layer',
          layerId: diff.layerId,
          payload: {
            type: 'geojson',
            displayName: layer.displayName,
            location: {
              type: 'api',
              url: layer.source.location.url
            }
          }
        };
      } else if (
        layer.source.type === 'geojson' &&
        layer.source.location.type === 'file'
      ) {
        inverse = {
          type: 'add-layer',
          layerId: diff.layerId,
          payload: {
            type: 'geojson',
            displayName: layer.displayName,
            location: {
              type: 'file',
              fileName: layer.source.location.fileName,
              featureCollection: layer.source.sourceData
            }
          }
        };
      }

      // Apply the patch.
      delete ir.layers[diff.layerId];

      break;
    }
    case 'rename-layer': {
      const layer = ir.layers[diff.layerId];

      // Derive the inverse diff prior to applying the patch.
      inverse = {
        type: 'rename-layer',
        layerId: diff.layerId,
        payload: {
          displayName: layer.displayName
        }
      };

      // Apply the patch.
      layer.displayName = diff.payload.displayName;

      break;
    }
  }

  return {
    diff,
    ir,
    inverseDiff: inverse
  };
}
