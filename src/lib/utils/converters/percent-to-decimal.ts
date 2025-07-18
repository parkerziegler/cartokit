import { z } from 'zod';

export const percentToDecimalSchema = z.number().transform((val) => val / 100);

export function percentToDecimal(val: number): number {
  return percentToDecimalSchema.parse(val);
}
