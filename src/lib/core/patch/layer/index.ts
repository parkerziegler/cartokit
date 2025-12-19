import * as Comlink from 'comlink';
import type { FeatureCollection } from 'geojson';
import { get } from 'svelte/store';

import type { PatchFnParams, PatchFnResult } from '$lib/core/patch';
import { ir } from '$lib/stores/ir';
import type { CartoKitLayer } from '$lib/types';
import { randomColor } from '$lib/utils/color';
import {
  DEFAULT_OPACITY,
  DEFAULT_RADIUS,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH
} from '$lib/utils/constants';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';

/**
 * Generate a CartoKitLayer for a given GeoJSON dataset, using the dataset's
 * Geometry type to select the appropriate member from the CartoKitLayer union.
 *
 * @param {FeatureCollection} featureCollection – The GeoJSON FeatureCollection
 * associated with the layer.
 * @returns – A default CartoKitLayer appropriate for the input geometry type.
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
          size: DEFAULT_RADIUS,
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
          visibility: 'visible',
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
          visibility: 'visible',
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
          visibility: 'visible',
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

export async function patchLayerDiffs(
  params: Promise<PatchFnParams>
): Promise<PatchFnResult> {
  const { diff, ir } = await params;

  switch (diff.type) {
    case 'add-layer': {
      if (diff.payload.type === 'api') {
        const fetchGeoJSONWorker = new Worker(
          new URL('$lib/utils/source/worker.ts', import.meta.url),
          { type: 'module' }
        );
        const fetchGeoJSON =
          Comlink.wrap<(url: string) => Promise<FeatureCollection>>(
            fetchGeoJSONWorker
          );

        const featureCollection = await fetchGeoJSON(diff.payload.url);
        const layer = generateCartoKitLayer(featureCollection, {
          displayName: diff.payload.displayName,
          layerId: diff.layerId,
          url: diff.payload.url
        });

        ir.layers[diff.layerId] = layer;
      } else {
        const layer = generateCartoKitLayer(diff.payload.featureCollection, {
          displayName: diff.payload.displayName,
          layerId: diff.layerId,
          fileName: diff.payload.fileName
        });

        ir.layers[diff.layerId] = layer;
      }

      break;
    }
    case 'layer-visibility': {
      const layer = ir.layers[diff.layerId];

      layer.layout.visibility = diff.payload.visibility;

      break;
    }
    case 'layer-tooltip-visibility': {
      const layer = ir.layers[diff.layerId];

      layer.layout.tooltip.visible = diff.payload.visible;

      break;
    }
    case 'remove-layer': {
      delete ir.layers[diff.layerId];
      break;
    }
    case 'rename-layer': {
      const layer = ir.layers[diff.layerId];

      layer.displayName = diff.payload.displayName;

      break;
    }
  }

  return {
    diff,
    ir
  };
}
