import * as Comlink from 'comlink';
import { fetchGeoJSON } from '$lib/utils/source';

Comlink.expose(fetchGeoJSON);
