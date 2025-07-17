import { z } from 'zod';

const rangeSchema = (min: number, max: number) =>
  z.coerce
    .number()
    .min(min)
    .max(max)
    .transform((val) => Math.min(Math.max(val, min), max))
    .catch((err) => {
      if (err.error.issues[0].code === 'too_big') {
        return max;
      }

      return min;
    });

export function validateRange(val: number, min: number, max: number): number {
  return rangeSchema(min, max).parse(val);
}
