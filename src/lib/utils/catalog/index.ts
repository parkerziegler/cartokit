import * as d3 from 'd3';
import { set, isFinite } from 'lodash-es';
import { ckmeans } from 'simple-statistics';

import type { CartoKitLayer, Catalog } from '$lib/types';
import { selectTileStats } from '$lib/utils/pmtiles';

/**
 * Build a catalog of pre-computed statistics for a {@link CartoKitLayer}.
 *
 * @param layer A {@link CartoKitLayer} to add to the catalog.
 * @returns The built {@link Catalog}.
 */
export function buildCatalog(layer: CartoKitLayer): Catalog {
  const catalog: Catalog = {};

  switch (layer.source.type) {
    case 'geojson': {
      const features = layer.source.data.features;

      Object.entries(features[0].properties || {}).forEach(
        ([attribute, value]) => {
          if (isFinite(value)) {
            const domain = features
              .map((feature) => feature.properties?.[attribute])
              .filter(Number.isFinite);
            const [min, max] = d3.extent(domain)!;

            set(catalog, `${layer.id}.${attribute}.type`, 'number');
            set(catalog, `${layer.id}.${attribute}.min`, min);
            set(catalog, `${layer.id}.${attribute}.max`, max);
            set(
              catalog,
              `${layer.id}.${attribute}.unique`,
              new Set(domain).size
            );
            set(catalog, `${layer.id}.${attribute}.quantiles.domain`, domain);

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
                `${layer.id}.${attribute}.jenks.${k}.breaks`,
                breaks
              );
            });
          } else if (typeof value === 'string') {
            const values = features
              .map((feature) => feature.properties?.[attribute])
              .filter((v) => typeof v === 'string');
            const distinct = Array.from(new Set(values));

            set(catalog, `${layer.id}.${attribute}.type`, 'string');
            set(catalog, `${layer.id}.${attribute}.values`, distinct);
            set(catalog, `${layer.id}.${attribute}.unique`, distinct.length);
          } else if (typeof value === 'boolean') {
            const values = features
              .map((feature) => feature.properties?.[attribute])
              .filter((v) => typeof v === 'boolean');
            const distinct = Array.from(new Set(values));

            set(catalog, `${layer.id}.${attribute}.type`, 'boolean');
            set(catalog, `${layer.id}.${attribute}.values`, distinct);
            set(catalog, `${layer.id}.${attribute}.unique`, distinct.length);
          }
        }
      );
      break;
    }
    case 'vector': {
      const attributes = selectTileStats(layer.source).attributes;

      attributes.forEach((attribute) => {
        switch (attribute.type) {
          case 'number': {
            set(catalog, `${layer.id}.${attribute.attribute}.type`, 'number');
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.min`,
              attribute.min
            );
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.max`,
              attribute.max
            );
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.unique`,
              attribute.count
            );
            break;
          }
          case 'string':
          case 'boolean': {
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.type`,
              attribute.type
            );
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.values`,
              attribute.values
            );
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.unique`,
              attribute.count
            );
            break;
          }
        }
      });
      break;
    }
  }

  return catalog;
}
