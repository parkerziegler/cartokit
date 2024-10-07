import * as Comlink from 'comlink';
import * as d3 from 'd3';
import { set } from 'lodash-es';
import { ckmeans } from 'simple-statistics';

import type { CartoKitLayer, Catalog } from '$lib/types';
import { CLASSIFICATION_METHODS } from '$lib/utils/classification';
import { isPropertyQuantitative } from '$lib/utils/property';

export function buildCatalog(layer: CartoKitLayer): Catalog {
  const features = layer.data.geojson.features;
  const properties = Object.entries(features[0].properties || {})
    .filter(([_, value]) => isPropertyQuantitative(value))
    .map(([key]) => key);
  const catalog: Catalog = {};

  properties.forEach((property) => {
    CLASSIFICATION_METHODS.forEach((method) => {
      const domain = features.map((feature) => feature.properties?.[property]);
      const extent = d3.extent(domain);
      const [min, max]: [number, number] =
        typeof extent[0] === 'undefined' || typeof extent[1] === 'undefined'
          ? [0, 1]
          : extent;

      switch (method) {
        case 'Quantile': {
          set(catalog, `${layer.id}.${property}.${method}.domain`, domain);

          break;
        }
        case 'Jenks': {
          d3.range(3, 10).forEach((k) => {
            // If we have too few features for the number of classes, do not
            // add an entry to the catalog.
            if (domain.length < k) {
              return;
            }

            // Derive Jenks breaks using ckmeans clustering.
            const breaks = ckmeans(domain, k).map(
              (cluster) => cluster[cluster.length - 1]
            );

            // Remove the last break—this corresponds to the max.
            breaks.pop();

            set(
              catalog,
              `${layer.id}.${property}.${method}.${k}.breaks`,
              breaks
            );
          });

          break;
        }
        case 'Equal Interval': {
          set(catalog, `${layer.id}.${property}.${method}.domain`, [min, max]);
          break;
        }
        case 'Manual':
          break;
      }
    });
  });

  return catalog;
}

Comlink.expose(buildCatalog);
