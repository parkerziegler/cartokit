import * as Comlink from 'comlink';
import type { FeatureCollection } from 'geojson';
import { get } from 'svelte/store';

import type { CartoKitDiff } from '$lib/core/diff';
import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { ir } from '$lib/stores/ir';
import { catalog } from '$lib/state/catalog.svelte';
import type { CartoKitLayer, Catalog } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_SIZE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

/**
 * Generate a {@link CartoKitLayer} for a given GeoJSON dataset, using the
 * dataset's geometry type to select the appropriate member from the
 * {@link CartoKitLayer} union.
 *
 * @param featureCollection The GeoJSON FeatureCollection associated with the layer.
 * @param options The options for the {@link CartoKitLayer}.
 * @param options.displayName The display name of the {@link CartoKitLayer}.
 * @param options.layerId The ID of the {@link CartoKitLayer}.
 * @param options.url The URL of the GeoJSON dataset.
 * @param options.fileName The file name of the GeoJSON dataset.
 * @returns A default {@link CartoKitLayer} appropriate for the input geometry type.
 */
function generateCartoKitLayer(
  featureCollection: FeatureCollection,
  options: {
    displayName: string;
    layerId: string;
    url?: string;
    fileName?: string;
  }
): CartoKitLayer {
  const geometryType = getFeatureCollectionGeometryType(featureCollection);
  const color = randomColor();
  const z = Object.values(get(ir).layers).length;

  switch (geometryType) {
    case 'Point':
    case 'MultiPoint':
      return {
        id: options.layerId,
        displayName: options.displayName,
        type: 'Point',
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
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
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
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
        data: {
          geojson: featureCollection,
          sourceGeojson: featureCollection,
          fileName: options.fileName,
          url: options.url,
          transformations: []
        },
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

      if (diff.payload.type === 'api') {
        // Fetch the GeoJSON data in a worker thread.
        const sourceWorker = new Worker(
          new URL('$lib/utils/source/worker.ts', import.meta.url),
          { type: 'module' }
        );
        const fetchGeoJSON =
          Comlink.wrap<(url: string) => Promise<FeatureCollection>>(
            sourceWorker
          );

        const featureCollection = await fetchGeoJSON(diff.payload.url);
        layer = generateCartoKitLayer(featureCollection, {
          displayName: diff.payload.displayName,
          layerId: diff.layerId,
          url: diff.payload.url
        });
      } else {
        layer = generateCartoKitLayer(diff.payload.featureCollection, {
          displayName: diff.payload.displayName,
          layerId: diff.layerId,
          fileName: diff.payload.fileName
        });
      }

      // Derive the inverse diff after creating the layer.
      inverse = {
        type: 'remove-layer',
        layerId: diff.layerId,
        payload: {
          sourceLayerType: layer.type
        }
      };

      // Build the catalog for the layer in a worker thread.
      const catalogWorker = new Worker(
        new URL('$lib/utils/catalog/worker.ts', import.meta.url),
        { type: 'module' }
      );
      const buildCatalog =
        Comlink.wrap<(layer: CartoKitLayer) => Catalog>(catalogWorker);
      const catalogPatch = await buildCatalog(layer);
      catalog.value = { ...catalog.value, ...catalogPatch };

      // Apply the patch.
      ir.layers[diff.layerId] = layer;

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
      inverse = {
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
              featureCollection: layer.data.sourceGeojson
            }
      };

      // Remove the layer from the catalog.
      delete catalog.value[diff.layerId];

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
