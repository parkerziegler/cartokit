import type { SvelteHTMLElements } from 'svelte/elements';

import type { ThemeMode } from '$lib/types';

/**
 * Represents a basemap style in cartokit.
 */
export interface Basemap {
  /** The name of the basemap, set by the tile provider. */
  title: string;
  /** The tile ID of the basemap, set by the tile provider. */
  tileId: string;
  /** The source for the basemap thumbnail. */
  src: SvelteHTMLElements['enhanced:img']['src'];
  /** The default mode of the basemap, either 'light' or 'dark'. */
  mode: ThemeMode;
  /** The id of the first symbol layer in the basemap's style. */
  beforeId?: string;
}

/**
 * Represents the set of possible basemap providers in cartokit.
 */
export type BasemapProvider =
  'CARTO' | 'MapTiler' | 'Stadia Maps' | 'Stamen' | 'Custom';
