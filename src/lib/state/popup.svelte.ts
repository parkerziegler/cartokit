import type { GeoJsonProperties } from 'geojson';

import type { CartoKitLayer } from '$lib/types';

export const popup = $state<
  Record<
    CartoKitLayer['id'],
    {
      open: boolean;
      displayName: string;
      properties: GeoJsonProperties;
    }
  >
>({});
