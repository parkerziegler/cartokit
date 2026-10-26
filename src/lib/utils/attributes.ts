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
    .filter(([_, value]) => value.type === 'Quantitative')
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
    .filter(([_, value]) => value.type === 'Categorical')
    .map(([key]) => key);

  if (categoricalAttributes.length === 0) {
    throw new Error('No categorical attributes found in dataset.');
  }

  return categoricalAttributes[0];
}
