import { writable } from 'svelte/store';

import type { VercelEnv } from '$lib/types';

export const env = writable<VercelEnv>('development');
