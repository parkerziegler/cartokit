import type { SvelteHTMLElements } from 'svelte/elements';

import type { CartoKitLayer, CartoKitSource } from '$lib/types';

/** Represents a dataset gallery item in cartokit. */
export interface GalleryItem {
  /** The unique identifier of the dataset. */
  id: string;
  /** The display name of the dataset. */
  displayName: string;
  /** The attribution for the dataset's source. */
  attribution: string;
  /** The remote URL of the dataset. */
  url: string;
  /** The source for the dataset thumbnail. */
  src: SvelteHTMLElements['enhanced:img']['src'];
  /** The type of layer used to render the dataset. */
  type: CartoKitLayer['type'];
  /** The format of the dataset's source. */
  format: CartoKitSource['type'];
}
