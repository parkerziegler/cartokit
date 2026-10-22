import type { Catalog } from '$lib/types/catalog';

export const catalog = $state<{ value: Catalog }>({ value: {} });
