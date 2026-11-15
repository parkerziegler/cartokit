import type { Catalog } from '#lib/types/catalog.ts';

export const catalog = $state<{ value: Catalog }>({ value: {} });
