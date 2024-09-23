import { writable } from 'svelte/store';

import type { Catalog } from '$lib/types';

export const catalog = writable<Catalog>({});
