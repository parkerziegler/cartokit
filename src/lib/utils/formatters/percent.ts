import { z } from 'zod';

const formatPercentSchema = z.number().transform((val) => `${val}%`);

export function formatPercent(val: number): string {
  return formatPercentSchema.parse(val);
}
