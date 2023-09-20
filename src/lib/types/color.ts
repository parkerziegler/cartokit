import * as d3 from 'd3';

import { reverseD3ColorScheme } from '$lib/utils/color';

export const COLOR_SCALES = [
  'Quantile',
  'Equal Interval',
  'Jenks',
  'Manual'
] as const;

export type ColorScale = (typeof COLOR_SCALES)[number];

export const COLOR_SCHEMES = [
  // Sequential schemes.
  d3.schemeBlues,
  d3.schemeGreens,
  d3.schemeGreys,
  d3.schemeOranges,
  d3.schemePurples,
  d3.schemeReds,
  d3.schemeBuGn,
  d3.schemeBuPu,
  d3.schemeGnBu,
  d3.schemeOrRd,
  d3.schemePuBuGn,
  d3.schemePuBu,
  d3.schemePuRd,
  d3.schemeRdPu,
  d3.schemeYlGnBu,
  d3.schemeYlGn,
  d3.schemeYlOrBr,
  d3.schemeYlOrRd,
  // Diverging schemes.
  d3.schemeBrBG,
  d3.schemePRGn,
  d3.schemePiYG,
  d3.schemePuOr,
  d3.schemeRdBu,
  d3.schemeRdGy,
  d3.schemeRdYlBu,
  d3.schemeRdYlGn,
  d3.schemeSpectral
];
export const COLOR_SCHEMES_REV = COLOR_SCHEMES.map(reverseD3ColorScheme);

export type ColorScheme = (typeof COLOR_SCHEMES)[number];
