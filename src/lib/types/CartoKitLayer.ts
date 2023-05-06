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
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

export interface CartoKitChoroplethLayer extends Layer {
  type: 'Choropleth';
  style: {
    fill: {
      attribute: string;
      scale: ColorScale;
      scheme: ColorScheme;
      count: number;
      thresholds: number[];
    };
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

export interface CartoKitProportionalSymbolLayer extends Layer {
  type: 'Proportional Symbol';
  style: {
    size: {
      attribute: string;
      min: number;
      max: number;
    };
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

export interface CartoKitDotDensityLayer extends Layer {
  type: 'Dot Density';
  style: {
    dots: {
      attribute: string;
      size: number;
      value: number;
    };
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
}

export type CartoKitLayer =
  | CartoKitFillLayer
  | CartoKitChoroplethLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitDotDensityLayer;
