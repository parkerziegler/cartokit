import type { FeatureCollection } from 'geojson';

/**
 * Represents methods for generating discrete steps in continuous numerical data.
 */
export type ClassificationMethod =
  | 'Quantile'
  | 'Equal Interval'
  | 'Jenks'
  | 'Manual';

/**
 * Represents a numberic color scheme.
 */
export type QuantitativeColorScheme = readonly (readonly string[])[];

/**
 * Represents a categorical color scheme.
 */
export type CategoricalColorScheme = readonly string[];

/**
 * Represents the cartographic form of a layer.
 *
 * Layer types convey high-level information about the display of a layer, its
 * primary encoding channels, and the set of controls users have to manipulate
 * its appearance.
 */
export type LayerType =
  | 'Point'
  | 'Line'
  | 'Polygon'
  | 'Choropleth'
  | 'Proportional Symbol'
  | 'Dot Density';

export type VisualizationType = 'Quantitative' | 'Categorical';

/**
 * Represents a transformation—either internal or user-defined—applied to a
 * layer.
 *
 * @property {string} name - The function name of the transformation.
 * @property {string} definition - The function body of the transformation.
 * @property {'geometric' | 'statistical'} type - The type of the transformation,
 * either geometric or statistical. This information is used by our code gener-
 * ation algorithm to determine whether modules from Turf.js need to be loaded.
 */
export interface Transformation {
  name: string;
  definition: string;
  type: 'geometric' | 'statistical';
}

/**
 * Represents the underlying data and metadata of a layer. This object maintains
 * two copies of a layer's GeoJSON data in memory:
 *
 *   1. The source GeoJSON at the time of layer creation. All accumulated trans-
 *      formations are executed against this copy to produce the current GeoJSON.
 *   2. The current GeoJSON of the layer, used for display.
 *
 * @property url - The URL of the data source, if fetched from a remote server.
 * @property fileName - The name of the data source's file on disk, if loaded
 * locally.
 * @property geojson - The current GeoJSON of the layer.
 * @property sourceGeojson - The source GeoJSON of the layer.
 */
interface LayerData {
  url?: string;
  fileName?: string;
  geojson: FeatureCollection;
  sourceGeojson: FeatureCollection;
  transformations: Transformation[];
}

/**
 * Represents the base structure of a layer in cartokit. All layers extend from
 * this interface.
 *
 * @property {string} id - A globally unique identifier for the layer.
 * @property {string} displayName - A user-supplied display name for the layer.
 * @property {LayerType} type - The type of the layer, @see LayerType.
 * @property {LayerData} data - The data and metadata of the layer, @see LayerData.
 */
interface Layer {
  id: string;
  displayName: string;
  type: LayerType;
  data: LayerData;
}

/**
 * Represents a Point layer in cartokit. Point layers have a consistent radius,
 * fill, and stroke across all points.
 *
 * @property {'Point'} type - The type of the layer, 'Point'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitPointLayer extends Layer {
  type: 'Point';
  style: {
    size: number;
    fill?: ConstantStyle;
    stroke?: ConstantStroke;
  };
}

/**
 * Represents a Line layer in cartokit. Line layers have a consistent, required
 * stroke across all lines.
 *
 * @property {'Line'} type - The type of the layer, 'Line'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitLineLayer extends Layer {
  type: 'Line';
  style: {
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Polygon layer in cartokit. Polygon layers have a consistent fill
 * and stroke across all polygons.
 *
 * @property {'Polygon'} type - The type of the layer, 'Polygon'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitPolygonLayer extends Layer {
  type: 'Polygon';
  style: {
    fill?: ConstantStyle;
    stroke?: ConstantStroke;
  };
}

/**
 * Represents a Proportional Symbol layer in cartokit. Proportional Symbol lay-
 * ers encode continous numberic data using the size of points, bounded by mini-
 * mum and maximum values.
 *
 * @property {'Proportional Symbol'} type - The type of the layer, 'Proportional
 * Symbol'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitProportionalSymbolLayer extends Layer {
  type: 'Proportional Symbol';
  style: {
    size: ProportionalSymbolSize;
    fill?: ConstantStyle;
    stroke?: ConstantStroke;
  };
}

/**
 * Represents a Choropleth layer in cartokit. Choropleth layers map a data value
 * to the color of a region using a classification method. Classification can be
 * either numeric or categorical.
 *
 * @property {'Choropleth'} type - The type of the layer, 'Choropleth'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitChoroplethLayer extends Layer {
  type: 'Choropleth';
  style: {
    fill: QuantitativeFill | CategoricalFill;
    stroke?: ConstantStroke;
  };
}

/**
 * Represents a Dot Density layer in cartokit. Dot Density layers map a data
 * value to a specific number of dots within a region. The size of the dots is
 * constant.
 *
 * @property {'Dot Density'} type - The type of the layer, 'Dot Density'.
 * @property {Object} style - The style of the layer.
 */
export interface CartoKitDotDensityLayer extends Layer {
  type: 'Dot Density';
  style: {
    dots: DotDensityDots;
    fill?: ConstantStyle;
    stroke?: ConstantStroke;
  };
}

/**
 * Represents a layer in cartokit. The CartoKitLayer type is a union of all
 * possible layer types.
 */
export type CartoKitLayer =
  | CartoKitPointLayer
  | CartoKitProportionalSymbolLayer
  | CartoKitLineLayer
  | CartoKitPolygonLayer
  | CartoKitChoroplethLayer
  | CartoKitDotDensityLayer;

/**
 * Represents a constant fill style object. A constant fill applies a uniform
 * color and opacity to all features in a layer.
 *
 * @property {string} color - The fill color.
 * @property {number} opacity - The fill opacity.
 */
export interface ConstantStyle {
  color: string;
  opacity: number;
}

/**
 * Represents a categorical style object.
 *
 * @property {'Categorical'} type - The type of the style object, 'Categorical'.
 * @property {string} attribute - The attribute of the GeoJSON data to classify.
 * @property {CategoricalColorScheme} scheme - The color scheme to use,
 * @see CategoricalColorScheme.
 * @property {string[]} categories - The categorical values for the attribute.
 * @property {number} opacity - The fill or stroke opacity.
 */
export interface CategoricalStyle {
  type: 'Categorical';
  attribute: string;
  categories: string[];
  scheme: CategoricalColorScheme;
  opacity: number;
}

export type CategoricalFill = CategoricalStyle;

/**
 * Represents a constant stroke style object. A constant stroke applies a uni-
 * form color, width, and opacity to all features in a layer.
 *
 * @property {string} color - The stroke color.
 * @property {number} width - The stroke width.
 * @property {number} opacity - The stroke opacity.
 */
export interface ConstantStroke extends ConstantStyle {
  width: number;
}

/**
 * Represents a proportional symbol size style object. A proportional symbol
 * size style object specifies the attribute of the GeoJSON data to map to the
 * size of each point, bounded by minimum and maximum values.
 *
 * @property {string} attribute - The attribute of the GeoJSON data to map to
 * the size of the points.
 * @property {number} min - The minimum size of the points.
 * @property {number} max - The maximum size of the points.
 */
interface ProportionalSymbolSize {
  attribute: string;
  min: number;
  max: number;
}

/**
 * Represents a quantitative style object. A quantitative stlye object specifies
 * a classification method to bin continuous numerical data into a discrete set
 * of thresholds. Each feature of the map is colored according to the "bin" it
 * falls into.
 *
 * @property {'Quantitative'} type - The type of the fill style, 'Quantitative'.
 * @property {string} attribute - The attribute of the GeoJSON data to classify.
 * @property {ClassificationMethod} method - The classification method to use,
 * @see ClassificationMethod.
 * @property {QuantitativeColorScheme} scheme - The color scheme to use, @see QuantitativeColorScheme.
 * @property {number} count - The number of thresholds.
 * @property {number[]} thresholds - The thresholds generated by the classifi-
 * cation method from the data.
 * @property {number} opacity - The fill or stroke opacity.
 */
export interface QuantitativeStyle {
  type: 'Quantitative';
  attribute: string;
  method: ClassificationMethod;
  scheme: QuantitativeColorScheme;
  count: number;
  thresholds: number[];
  opacity: number;
}

export type QuantitativeFill = QuantitativeStyle;

/**
 * Represents a dot density dot style object. A dot density dot style object
 * specifies the attribute of the GeoJSON data to divide by the dot value of the
 * layer to produce a discrete number of dots. The size of the dots is constant.
 *
 * @property {string} attribute - The attribute of the GeoJSON data to map to
 * the number of dots.
 * @property {number} size - The size of the dots.
 * @property {number} value - The dot value, representing the ratio of source
 * data units to number of dots.
 */
export interface DotDensityDots {
  attribute: string;
  size: number;
  value: number;
}
