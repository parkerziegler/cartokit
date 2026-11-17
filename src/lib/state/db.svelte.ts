import type { DuckDBState } from '#lib/types/db.ts';

export const db = $state<{
  value:
    | (DuckDBState & {
        worker: Worker;
      })
    | null;
}>({ value: null });
