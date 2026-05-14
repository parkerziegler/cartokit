import * as d3 from 'd3';
import { set } from 'lodash-es';
import { ckmeans } from 'simple-statistics';

import type {
  CartoKitLayer,
  Catalog,
  CatalogEntry,
  NumericCatalogEntry
} from '$lib/types';
import {
  isPropertyBoolean,
  isPropertyCategorical,
  isPropertyQuantitative
} from '$lib/utils/property';

/**
 * Narrow a {@link CatalogEntry} to a {@link NumericCatalogEntry}. Throws if the
 * entry does not describe a numeric attribute.
 *
 * @param entry The catalog entry to narrow.
 * @param attribute The attribute.
 * @returns The narrowed {@link NumericCatalogEntry}.
 */
export function asNumericEntry(
  entry: CatalogEntry,
  attribute: string
): NumericCatalogEntry {
  if (entry.type !== 'number') {
    throw new Error(
      `Expected a numeric catalog entry for ${attribute}; got ${entry.type}.`
    );
  }

  return entry;
}

/**
 * Build a catalog of pre-computed statistics for a {@link CartoKitLayer}.
 *
 * @param layer The layer.
 * @returns The built {@link Catalog}.
 */
export function buildCatalog(layer: CartoKitLayer): Catalog {
  const catalog: Catalog = {};

  switch (layer.source.type) {
    case 'geojson': {
      const features = layer.source.data.features;
      const sampleProperties = features[0].properties || {};

      Object.keys(sampleProperties).forEach((property) => {
        const sample = sampleProperties[property];

        if (isPropertyQuantitative(sample)) {
          const domain = features
            .map((feature) => feature.properties?.[property])
            .filter(Number.isFinite);
          const extent = d3.extent(domain);
          const [min, max]: [number, number] =
            typeof extent[0] === 'undefined' || typeof extent[1] === 'undefined'
              ? [0, 1]
              : extent;

          set(catalog, `${layer.id}.${property}.type`, 'number');
          set(catalog, `${layer.id}.${property}.min`, min);
          set(catalog, `${layer.id}.${property}.max`, max);
          set(catalog, `${layer.id}.${property}.unique`, new Set(domain).size);
          set(catalog, `${layer.id}.${property}.quantiles.domain`, domain);

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

            set(catalog, `${layer.id}.${property}.jenks.${k}.breaks`, breaks);
          });
        } else if (isPropertyCategorical(sample)) {
          const values = features
            .map((feature) => feature.properties?.[property])
            .filter(isPropertyCategorical);
          const distinct = Array.from(new Set(values));

          set(catalog, `${layer.id}.${property}.type`, 'string');
          set(catalog, `${layer.id}.${property}.values`, distinct);
          set(catalog, `${layer.id}.${property}.unique`, distinct.length);
        } else if (isPropertyBoolean(sample)) {
          const values = features
            .map((feature) => feature.properties?.[property])
            .filter(isPropertyBoolean);
          const distinct = Array.from(new Set(values));

          set(catalog, `${layer.id}.${property}.type`, 'boolean');
          set(catalog, `${layer.id}.${property}.values`, distinct);
          set(catalog, `${layer.id}.${property}.unique`, distinct.length);
        }
      });
      break;
    }
    case 'vector': {
      const attributes =
        layer.source.tilestats.layers[layer.source.sourceLayerIndex].attributes;

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
          case 'string': {
            set(catalog, `${layer.id}.${attribute.attribute}.type`, 'string');
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
          case 'boolean': {
            set(catalog, `${layer.id}.${attribute.attribute}.type`, 'boolean');
            set(
              catalog,
              `${layer.id}.${attribute.attribute}.values`,
              attribute.values
            );
            set(catalog, `${layer.id}.${attribute.attribute}.unique`, 2);
            break;
          }
        }
      });
      break;
    }
  }

  return catalog;
}
