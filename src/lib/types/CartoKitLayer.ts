import type { FeatureCollection } from 'geojson';

import type { MapType } from '$lib/types/map-types';
import type { ColorScale, ColorScheme } from '$lib/types/color';

interface Layer {
  id: string;
  displayName: string;
  type: MapType;
  data: {
    url?: string;
    geoJSON: FeatureCollection;
    rawGeoJSON: FeatureCollection;
    fileName?: string;
  };
  style: {
    opacity: number;
  };
}

export interface CartoKitFillLayer extends Layer {
  type: 'Fill';
  style: {
    fill: string;
    opacity: number;
  };
}

export interface CartoKitChoroplethLayer extends Layer {
  type: 'Choropleth';
  attribute: string;
  style: {
    breaks: {
      scale: ColorScale;
      scheme: ColorScheme;
      count: number;
      thresholds: number[];
    };
    opacity: number;
  };
}

export interface CartoKitProportionalSymbolLayer extends Layer {
  type: 'Proportional Symbol';
  attribute: string;
  style: {
    size: {
      min: number;
      max: number;
    };
    fill: string;
    opacity: number;
  };
}

export interface CartoKitDotDensityLayer extends Layer {
  type: 'Dot Density';
  attribute: string;
  style: {
    dots: {
      size: number;
      value: number;
    };
    fill: string;
    opacity: number;
  };
}

export type CartoKitLayer =
  | CartoKitFillLayer
  | CartoKitChoroplethLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitDotDensityLayer;
