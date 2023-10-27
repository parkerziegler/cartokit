import type { FeatureCollection } from 'geojson';

import type { MapType } from '$lib/types/map-types';
import type { ColorScale, ColorScheme } from '$lib/types/color';
import type { Transformation } from '$lib/types/transformation';

interface Layer {
  id: string;
  displayName: string;
  type: MapType;
  data: {
    url?: string;
    geoJSON: FeatureCollection;
    rawGeoJSON: FeatureCollection;
    fileName?: string;
    transformations: Transformation[];
  };
}

export interface CartoKitPointLayer extends Layer {
  type: 'Point';
  style: {
    size: number;
    fill?: {
      color: string;
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
  };
}

export interface CartoKitLineLayer extends Layer {
  type: 'Line';
  style: {
    stroke: {
      color: string;
      width: number;
      opacity: number;
    };
  };
}

export interface CartoKitFillLayer extends Layer {
  type: 'Fill';
  style: {
    fill?: {
      color: string;
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
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
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
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
    fill?: {
      color: string;
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
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
    fill?: {
      color: string;
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
  };
}

export type CartoKitLayer =
  | CartoKitPointLayer
  | CartoKitLineLayer
  | CartoKitFillLayer
  | CartoKitChoroplethLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitDotDensityLayer;
