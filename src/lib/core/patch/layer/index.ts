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
import { CartoKitPMTiles, selectTileStats } from '$lib/utils/pmtiles';

interface GenerateCartoKitLayerOptions {
  layerId: string;
  displayName: string;
}

/**
 * Generate a {@link CartoKitLayer} for a given {@link CartoKitSource}.
 *
 * @param source The {@link CartoKitSource} associated with the layer.
 * @param options.layerId The fresh ID of the {@link CartoKitLayer}.
 * @param options.displayName The display name of the {@link CartoKitLayer}.
 * @returns A default {@link CartoKitLayer} appropriate for the input source.
 */
function generateCartoKitLayer(
  source: CartoKitSource,
  options: GenerateCartoKitLayerOptions
): CartoKitLayer {
  const geometryType =
    source.type === 'geojson'
      ? getFeatureCollectionGeometryType(source.data)
      : selectTileStats(source).geometry;
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
    case 'Line':
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
        const pmtiles = new CartoKitPMTiles(diff.payload.location.url);

        const [metadata, vectorLayers] = await Promise.all([
          pmtiles.getMetadata(),
          pmtiles.getVectorLayers()
        ]);

        layer = generateCartoKitLayer(
          {
            type: 'vector',
            location: diff.payload.location,
            sourceLayerId: vectorLayers[0].id,
            tilestats: metadata.tilestats,
            vectorLayers
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
      } else if (diff.payload.type === 'geojson') {
        let sourceData: FeatureCollection;

        // If the GeoJSON data is hosted at a remote API endpoint, fetch it in a
        // WebWorker to store in memory.
        if (diff.payload.location.type === 'api') {
          const sourceWorker = new Worker(
            new URL('$lib/utils/source/worker.ts', import.meta.url),
            { type: 'module' }
          );
          const fetchGeoJSON =
            Comlink.wrap<(url: string) => Promise<FeatureCollection>>(
              sourceWorker
            );

          sourceData = await fetchGeoJSON(diff.payload.location.url);
        } else {
          sourceData = diff.payload.location.featureCollection;
        }

        layer = generateCartoKitLayer(
          {
            type: 'geojson',
            location: diff.payload.location,
            data: sourceData,
            sourceData,
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
      } else if (layer.source.type === 'geojson') {
        inverse = {
          type: 'add-layer',
          layerId: diff.layerId,
          payload: {
            type: 'geojson',
            displayName: layer.displayName,
            location:
              layer.source.location.type === 'api'
                ? {
                    type: 'api',
                    url: layer.source.location.url
                  }
                : {
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
    case 'source-layer': {
      const layer = ir.layers[diff.layerId];

      if (layer.source.type === 'vector') {
        // Derive the inverse diff prior to applying the patch.
        inverse = {
          type: 'source-layer',
          layerId: diff.layerId,
          payload: {
            sourceSourceLayerId: diff.payload.targetSourceLayerId,
            targetSourceLayerId: layer.source.sourceLayerId
          }
        };

        // Apply the patch.
        layer.source.sourceLayerId = diff.payload.targetSourceLayerId;
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
