import { z } from 'zod';

export const percentSchema = z.string().transform((val) => {
  const num = parseFloat(val);

  if (isNaN(num)) {
    return 0;
  }

  return Math.min(Math.max(num, 0), 100);
});

export function validatePercent(val: string): number {
  return percentSchema.parse(val);
}
