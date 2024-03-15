import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { writable } from 'svelte/store';

export const db = writable<AsyncDuckDB>();
