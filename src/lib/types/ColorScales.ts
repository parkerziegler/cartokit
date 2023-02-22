export const COLOR_SCALES = ['Quantile', 'Quantize'] as const;
export type ColorScale = (typeof COLOR_SCALES)[number];
