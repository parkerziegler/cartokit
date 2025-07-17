import { z } from 'zod';

export const decimalToPercentSchema = z.number().transform((val) => val * 100);

export function decimalToPercent(val: number): number {
  return decimalToPercentSchema.parse(val);
}
