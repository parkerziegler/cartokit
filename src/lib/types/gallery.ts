import type { SvelteHTMLElements } from 'svelte/elements';

import type { CartoKitLayer, CartoKitSource } from '$lib/types';

/**
 * Represents a dataset gallery item in cartokit.
 */
export interface GalleryItem {
  id: string;
  name: string;
  attribution: string;
  url: string;
  src: SvelteHTMLElements['enhanced:img']['src'];
  type: CartoKitLayer['type'];
  format: CartoKitSource['type'];
}
