import { catalog } from '$lib/state/catalog.svelte';

/**
 * Select the first quantitative attribute from a dataset.
 *
 * @param layerId The id of the layer whose catalog entry should be queried.
 * @returns The name of the first quantitative attribute found in the dataset.
 * @throws If no quantitative attributes are found in the dataset.
 */
export function selectQuantitativeAttribute(layerId: string) {
  const quantitativeAttributes = Object.entries(
    catalog.value[layerId].attributes
  )
    .filter(([_, value]) => value.type === 'number')
    .map(([key]) => key);

  if (quantitativeAttributes.length === 0) {
    throw new Error('No quantitative attributes found in dataset.');
  }

  return quantitativeAttributes[0];
}

/**
 * Select the first categorical attribute from a dataset.
 *
 * @param layerId The id of the layer whose catalog entry should be queried.
 * @returns The name of the first categorical attribute found in the dataset.
 * @throws If no categorical attributes are found in the dataset.
 */
export function selectCategoricalAttribute(layerId: string) {
  const categoricalAttributes = Object.entries(
    catalog.value[layerId].attributes
  )
    .filter(([_, value]) => value.type === 'string' || value.type === 'boolean')
    .map(([key]) => key);

  if (categoricalAttributes.length === 0) {
    throw new Error('No categorical attributes found in dataset.');
  }

  return categoricalAttributes[0];
}

/**
 * Find the unique category values observed for an attribute in a dataset.
 *
 * @param layerId The id of the layer whose catalog entry should be queried.
 * @param attribute The attribute to probe for categories.
 * @returns The unique categorical values of the attribute.
 */
export function findAttributeCategories(
  layerId: string,
  attribute: string
): unknown[] {
  const entry = catalog.value[layerId].attributes[attribute];

  switch (entry?.type) {
    case 'string':
      // Permit '0' as a valid category, but not the empty string.
      return entry.values.filter((value) => value !== '');
    case 'boolean':
      return entry.values;
    case 'number':
      // Vector sources catalog unique values in place of a full domain.
      return entry.values ?? Array.from(new Set(entry.quantiles?.domain ?? []));
    default:
      return [];
  }
}
