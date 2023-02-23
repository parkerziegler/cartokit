export const COLOR_SCALES = ['Quantile', 'Quantize', 'Jenks'] as const;
export type ColorScale = (typeof COLOR_SCALES)[number];
