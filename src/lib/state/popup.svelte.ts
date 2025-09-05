import type { CartoKitLayer } from '$lib/types';
import type { GeoJsonProperties } from 'geojson';

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
