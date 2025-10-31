import * as Comlink from 'comlink';
import { buildCatalog } from '$lib/utils/catalog';

Comlink.expose(buildCatalog);
