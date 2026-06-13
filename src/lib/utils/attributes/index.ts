import { isFinite } from 'lodash-es';

import type { CartoKitSource } from '$lib/types';
import { selectTileStats, selectVectorLayer } from '$lib/utils/pmtiles';

/**
 * Get the attribute names for a {@link CartoKitSource}.
 *
 * @param source The {@link CartoKitSource} to query.
 * @returns The attribute names for the {@link CartoKitSource}.
 */
export function selectAttributes(source: CartoKitSource) {
  switch (source.type) {
    case 'geojson': {
      return Object.keys(source.data.features[0].properties ?? {});
    }
    case 'vector': {
      const { fields } = selectVectorLayer(source);
      return Object.keys(fields);
    }
  }
}

/**
 * Select the first quantitative attribute from a dataset.
 *
 * @param source A {@link CartoKitSource} to query.
 * @returns The name of the first quantitative attribute found in the dataset.
 * @throws If no quantitative attributes are found in the dataset.
 */
export function selectQuantitativeAttribute(source: CartoKitSource) {
  switch (source.type) {
    case 'geojson': {
      for (const attribute in source.data.features[0].properties) {
        if (isFinite(source.data.features[0].properties[attribute])) {
          return attribute;
        }
      }
      break;
    }
    case 'vector': {
      const { fields } = selectVectorLayer(source);

      for (const [attribute, type] of Object.entries(fields)) {
        if (type === 'Number') {
          return attribute;
        }
      }
      break;
    }
  }

  throw new Error('No quantitative attributes found in dataset.');
}

/**
 * Select the first categorical attribute from a dataset.
 *
 * @param source A {@link CartoKitSource} to query.
 * @returns The name of the first categorical attribute found in the dataset.
 * @throws If no categorical attributes are found in the dataset.
 */
export function selectCategoricalAttribute(source: CartoKitSource) {
  switch (source.type) {
    case 'geojson': {
      for (const attribute in source.data.features[0].properties) {
        if (typeof source.data.features[0].properties[attribute] === 'string') {
          return attribute;
        }
      }
      break;
    }
    case 'vector': {
      const { fields } = selectVectorLayer(source);

      for (const [attribute, type] of Object.entries(fields)) {
        if (type === 'String') {
          return attribute;
        }
      }
      break;
    }
  }

  throw new Error('No categorical attributes found in dataset.');
}

/**
 * Find the unique category values observed for an attribute in a dataset.
 *
 * @param source A {@link CartoKitSource} to query.
 * @param attribute The attribute to probe for categories.
 * @returns The unique categorical values of the attribute.
 */
export function findAttributeCategories(
  source: CartoKitSource,
  attribute: string
): unknown[] {
  switch (source.type) {
    case 'geojson': {
      const categories = new Set<unknown>();

      for (const feature of source.data.features) {
        // Permit 0 and '0' as valid categories.
        if (
          feature.properties?.[attribute] !== undefined &&
          feature.properties?.[attribute] !== null &&
          feature.properties?.[attribute] !== '' &&
          !categories.has(feature.properties[attribute])
        ) {
          categories.add(feature.properties[attribute]);
        }
      }

      return Array.from(categories);
    }
    case 'vector': {
      const { attributes } = selectTileStats(source);
      const categories = new Set<unknown>();
      const attr = attributes.find((attr) => attr.attribute === attribute);

      if (attr) {
        for (const value of attr.values) {
          categories.add(value);
        }
      }

      return Array.from(categories);
    }
  }
}
