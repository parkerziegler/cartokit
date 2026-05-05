import type { SvelteHTMLElements } from 'svelte/elements';
import type { FeatureCollection } from 'geojson';

/**
 * Represents a quantitative D3 color scheme.
 */
export type QuantitativeColorScheme =
  // Sequential, single-hue schemes.
  | 'schemeBlues'
  | 'schemeGreens'
  | 'schemeGreys'
  | 'schemeOranges'
  | 'schemePurples'
  | 'schemeReds'
  // Sequential, multi-hue schemes.
  | 'schemeBuGn'
  | 'schemeBuPu'
  | 'schemeGnBu'
  | 'schemeOrRd'
  | 'schemePuBuGn'
  | 'schemePuBu'
  | 'schemePuRd'
  | 'schemeYlGnBu'
  | 'schemeYlGn'
  | 'schemeYlOrBr'
  | 'schemeYlOrRd'
  // Diverging schemes.
  | 'schemeBrBG'
  | 'schemePRGn'
  | 'schemePiYG'
  | 'schemePuOr'
  | 'schemeRdBu'
  | 'schemeRdGy'
  | 'schemeRdPu'
  | 'schemeRdYlBu'
  | 'schemeRdYlGn'
  | 'schemeSpectral';

/**
 * Represents a categorical D3 color scheme.
 */
export type CategoricalColorScheme =
  | 'schemeCategory10'
  | 'schemeAccent'
  | 'schemeDark2'
  | 'schemeObservable10'
  | 'schemePaired'
  | 'schemePastel1'
  | 'schemePastel2'
  | 'schemeSet1'
  | 'schemeSet2'
  | 'schemeSet3'
  | 'schemeTableau10';

/**
 * Represents the direction of a color scheme.
 */
export type SchemeDirection = 'Forward' | 'Reverse';

/**
 * Represents a color ramp.
 */
export type QuantitativeColorRamp =
  // Sequential, single-hue ramps.
  | 'interpolateBlues'
  | 'interpolateGreens'
  | 'interpolateGreys'
  | 'interpolateOranges'
  | 'interpolatePurples'
  | 'interpolateReds'
  // Sequential, multi-hue ramps.
  | 'interpolateBuGn'
  | 'interpolateBuPu'
  | 'interpolateGnBu'
  | 'interpolateOrRd'
  | 'interpolatePuBuGn'
  | 'interpolatePuBu'
  | 'interpolatePuRd'
  | 'interpolateRdPu'
  | 'interpolateYlGnBu'
  | 'interpolateYlGn'
  | 'interpolateYlOrBr'
  | 'interpolateYlOrRd'
  | 'interpolateCividis'
  | 'interpolateViridis'
  | 'interpolateInferno'
  | 'interpolateMagma'
  | 'interpolatePlasma'
  | 'interpolateWarm'
  | 'interpolateCool'
  | 'interpolateCubehelixDefault'
  | 'interpolateTurbo'
  // Diverging ramps.
  | 'interpolateBrBG'
  | 'interpolatePRGn'
  | 'interpolatePiYG'
  | 'interpolatePuOr'
  | 'interpolateRdBu'
  | 'interpolateRdGy'
  | 'interpolateRdYlBu'
  | 'interpolateRdYlGn'
  | 'interpolateSpectral'
  // Cyclical ramps.
  | 'interpolateRainbow'
  | 'interpolateSinebow';

/**
 * Represents the direction of a color ramp.
 */
export type RampDirection = 'Forward' | 'Reverse';

/**
 * Represents a continuous color scale for continuous numerical data.
 *
 * @property type The type of the color scale, 'Continuous'.
 * @property interpolator.id The {@link QuantitativeColorRamp} identifier for the
 * color scale.
 * @property interpolator.direction The {@link RampDirection} of the color scale.
 */
export interface ContinuousColorScale {
  type: 'Continuous';
  interpolator: {
    id: QuantitativeColorRamp;
    direction: RampDirection;
  };
}

/**
 * Represents a quantile color scale that discretizes continuous numerical data
 * into quantiles.
 *
 * @property type The type of the color scale, 'Quantile'.
 * @property scheme.id The {@link QuantitativeColorScheme} identifier for the
 * color scale.
 * @property scheme.direction The {@link SchemeDirection} of the color scale.
 * @property steps The number of discrete steps (classes) in the color scale.
 * @property thresholds The thresholds of the color scale.
 */
export interface QuantileColorScale {
  type: 'Quantile';
  scheme: {
    id: QuantitativeColorScheme;
    direction: SchemeDirection;
  };
  steps: number;
  thresholds: number[];
}

/**
 * Represents an equal interval (quantize) color scale that discretizes
 * continuous numerical data into equal intervals.
 *
 * @property type The type of the color scale, 'Equal Interval'.
 * @property scheme.id The {@link QuantitativeColorScheme} identifier for the
 * color scale.
 * @property scheme.direction The {@link SchemeDirection} of the color scale.
 * @property steps The number of discrete steps (classes) in the color scale.
 * @property thresholds The thresholds of the color scale.
 */
export interface EqualIntervalColorScale {
  type: 'Equal Interval';
  scheme: {
    id: QuantitativeColorScheme;
    direction: SchemeDirection;
  };
  steps: number;
  thresholds: number[];
}

/**
 * Represents a Jenks natural breaks color scale that discretizes continuous
 * numerical data into natural breaks using ckmeans clustering.
 *
 * @property type The type of the color scale, 'Jenks'.
 * @property scheme.id The {@link QuantitativeColorScheme} identifier for the
 * color scale.
 * @property scheme.direction The {@link SchemeDirection} of the color scale.
 * @property steps The number of discrete steps (classes) in the color scale.
 * @property thresholds The thresholds of the color scale.
 */
export interface JenksColorScale {
  type: 'Jenks';
  scheme: {
    id: QuantitativeColorScheme;
    direction: SchemeDirection;
  };
  steps: number;
  thresholds: number[];
}

/**
 * Represents a manual color scale that discretizes continuous numerical data
 * using user-defined thresholds.
 *
 * @property type The type of the color scale, 'Manual'.
 * @property scheme.id The {@link QuantitativeColorScheme} identifier for the
 * color scale.
 * @property scheme.direction The {@link SchemeDirection} of the color scale.
 * @property steps The number of discrete steps (classes) in the color scale.
 * @property thresholds The thresholds of the color scale.
 */
export interface ManualColorScale {
  type: 'Manual';
  scheme: {
    id: QuantitativeColorScheme;
    direction: SchemeDirection;
  };
  steps: number;
  thresholds: number[];
}

/**
 * Represents the set of possible quantitative color scales.
 */
export type QuantitativeColorScale =
  | ContinuousColorScale
  | QuantileColorScale
  | EqualIntervalColorScale
  | JenksColorScale
  | ManualColorScale;

/**
 * Represents a categorical color scale.
 *
 * @property type The type of the color scale, 'Categorical'.
 * @property scheme.id The {@link CategoricalColorScheme} identifier for the
 * color scale.
 * @property scheme.direction The {@link SchemeDirection} of the color scale.
 * @property categories The categories of the color scale.
 */
export interface CategoricalColorScale {
  type: 'Categorical';
  scheme: {
    id: CategoricalColorScheme;
    direction: SchemeDirection;
  };
  categories: unknown[];
}

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
  | 'Dot Density'
  | 'Heatmap';

/**
 * Represents the encoding channels of a layer.
 */
export type Channel = 'fill' | 'stroke' | 'size' | 'dot';

/**
 * Represents the visualization type for a given channel.
 */
export type VisualizationType = 'Quantitative' | 'Categorical' | 'Constant';

/**
 * Represents the kind of transformation.
 */
export type TransformationKind = 'geometric' | 'tabular';

/**
 * Represents a transformation—either internal or user-defined—applied to a
 * layer.
 *
 * @property name The function name of the transformation.
 * @property params The function parameters of the transformation.
 * @property paramTypes The types of the function parameters of the transforma-
 * tion.
 * @property returnType The type of the function return value of the transfor-
 * mation.
 * @property args The arguments passed to the transformation.
 * @property definitionTS The TypeScript function body of the transformation.
 * @property definitionJS The JavaScript function body of the transformation.
 * @property kind The {@link TransformationKind} of the transformation.
 */
export interface Transformation {
  name: string;
  params: string[];
  paramTypes: string[];
  returnType: string;
  definitionTS: string;
  definitionJS: string;
  kind: TransformationKind;
}

export interface TransformationCall extends Transformation {
  args: (string | number)[];
}

/**
 * Represents the underlying data and metadata of a layer. This object maintains
 * two copies of a layer's GeoJSON data in memory:
 *
 *   1. The source GeoJSON at the time of layer creation. All accumulated trans-
 *      formations are executed against this copy to produce the current
 *      GeoJSON.
 *   2. The current GeoJSON of the layer, used for display.
 *
 * @property url The URL of the data source, if fetched from a remote
 * server.
 * @property fileName The name of the data source's file on disk, if
 * loaded locally.
 * @property geojson The current GeoJSON of the layer.
 * @property sourceGeojson The source GeoJSON of the layer.
 */
interface LayerData {
  url?: string;
  fileName?: string;
  geojson: FeatureCollection;
  sourceGeojson: FeatureCollection;
  transformations: TransformationCall[];
}

/**
 * Represents the layout of a layer.
 *
 * @property visible Whether the layer is visible.
 * @property z The z-index of the layer.
 * @property tooltip.visible Whether the layer's tooltip is visible.
 */
interface LayerLayout {
  visible: boolean;
  z: number;
  tooltip: {
    visible: boolean;
  };
}

/**
 * Represents the base structure of a layer in cartokit. All layers extend from
 * this interface.
 *
 * @property id A globally unique identifier for the layer.
 * @property displayName A user-supplied display name for the layer.
 * @property type The type of the layer, {@link LayerType}.
 * @property data The data and metadata of the layer, {@link LayerData}.
 * @property layout The layout of the layer, {@link LayerLayout}.
 */
interface Layer {
  id: string;
  displayName: string;
  type: LayerType;
  data: LayerData;
  layout: LayerLayout;
}

/**
 * Represents a Point layer in cartokit. Point layers have a consistent radius,
 * fill, and stroke across all points.
 *
 * @property type The type of the layer, 'Point'.
 * @property style The style of the layer.
 */
export interface CartoKitPointLayer extends Layer {
  type: 'Point';
  style: {
    size: number;
    fill: ConstantFill | QuantitativeFill | CategoricalFill;
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Line layer in cartokit. Line layers have a consistent, required
 * stroke across all lines.
 *
 * @property type The type of the layer, 'Line'.
 * @property style The style of the layer.
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
 * @property type The type of the layer, 'Polygon'.
 * @property style The style of the layer.
 */
export interface CartoKitPolygonLayer extends Layer {
  type: 'Polygon';
  style: {
    fill: ConstantStyle;
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Proportional Symbol layer in cartokit. Proportional Symbol lay-
 * ers encode continous numberic data using the size of points, bounded by mini-
 * mum and maximum values.
 *
 * @property type The type of the layer, 'Proportional Symbol'.
 * @property style The style of the layer.
 */
export interface CartoKitProportionalSymbolLayer extends Layer {
  type: 'Proportional Symbol';
  style: {
    size: ProportionalSymbolStyle;
    fill: QuantitativeFill | CategoricalFill | ConstantFill;
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Choropleth layer in cartokit. Choropleth layers map a data value
 * to the color of a region using a classification method. Classification can be
 * either quantitative or categorical.
 *
 * @property type The type of the layer, 'Choropleth'.
 * @property style The style of the layer.
 */
export interface CartoKitChoroplethLayer extends Layer {
  type: 'Choropleth';
  style: {
    fill: QuantitativeFill | CategoricalFill;
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Dot Density layer in cartokit. Dot Density layers map a data
 * value to a specific number of dots within a region. The size of the dots is
 * constant.
 *
 * @property type The type of the layer, 'Dot Density'.
 * @property style The style of the layer.
 */
export interface CartoKitDotDensityLayer extends Layer {
  type: 'Dot Density';
  style: {
    dot: DotDensityStyle;
    size: number;
    fill: ConstantStyle;
    stroke: ConstantStroke;
  };
}

/**
 * Represents a Heatmap layer in cartokit. Heatmap layers map a data value to the
 * color of a region using a color ramp.
 *
 * @property type The type of the layer, 'Heatmap'.
 * @property style The style of the layer.
 */
export interface CartoKitHeatmapLayer extends Layer {
  type: 'Heatmap';
  style: {
    heatmap: HeatmapStyle;
  };
}

/**
 * Represents a layer in cartokit. The CartoKitLayer type is a union of all
 * possible layer types.
 */
export type CartoKitLayer =
  | CartoKitChoroplethLayer
  | CartoKitDotDensityLayer
  | CartoKitHeatmapLayer
  | CartoKitLineLayer
  | CartoKitPointLayer
  | CartoKitPolygonLayer
  | CartoKitProportionalSymbolLayer;

/**
 * Represents a constant style object. A constant style applies a uniform color
 * and opacity to all features in a layer.
 *
 * @property color The style's color.
 * @property opacity The style's opacity.
 * @property visible Whether the style is visible.
 */
export interface ConstantStyle {
  type: 'Constant';
  color: string;
  opacity: number;
  visible: boolean;
}

/**
 * An alias for ConstantStyle. Should be used when typing a fill style.
 */
export type ConstantFill = ConstantStyle;

/**
 * Represents a constant stroke style object. A constant stroke applies a uni-
 * form color, opacity, and stroke-width to all features in a layer.
 *
 * @property color The style's stroke color.
 * @property opacity The style's stroke opacity.
 * @property width The style's stroke width.
 * @property visible Whether the style is visible.
 */
export interface ConstantStroke extends ConstantStyle {
  width: number;
}

/**
 * Represents a categorical style object.
 *
 * @property type The type of the style object, 'Categorical'.
 * @property attribute The attribute of the GeoJSON data to classify.
 * @property scale The {@link CategoricalColorScale} definition.
 * @property categories The categorical values for the attribute.
 * @property opacity The fill or stroke opacity.
 */
export interface CategoricalStyle {
  type: 'Categorical';
  attribute: string;
  scale: CategoricalColorScale;
  opacity: number;
  visible: boolean;
}

/**
 * An alias for CategoricalStyle. Should be used when typing a fill style.
 */
export type CategoricalFill = CategoricalStyle;

/**
 * Represents a quantitative style object. A quantitative style object specifies
 * a classification method to bin continuous numerical data into a discrete set
 * of thresholds. Each feature of the map is colored according to the "bin" it
 * falls into.
 *
 * @property type The type of the fill style, 'Quantitative'.
 * @property attribute The attribute of the GeoJSON data to visualize.
 * @property scale The {@link QuantitativeColorScale} definition.
 * @property opacity The opacity of the style.
 * @property visible The visibility of the style.
 */
export interface QuantitativeStyle {
  type: 'Quantitative';
  attribute: string;
  scale: QuantitativeColorScale;
  opacity: number;
  visible: boolean;
}

/**
 * An alias for QuantitativeStyle. Should be used when typing a fill style.
 */
export type QuantitativeFill = QuantitativeStyle;

/**
 * Represents a proportional symbol size style object. A proportional symbol
 * size style object specifies the attribute of the GeoJSON data to map to the
 * size of each point, bounded by minimum and maximum values.
 *
 * @property attribute The attribute of the GeoJSON data to map to
 * the size of the points.
 * @property min The minimum size of the points.
 * @property max The maximum size of the points.
 */
interface ProportionalSymbolStyle {
  attribute: string;
  min: number;
  max: number;
}

/**
 * Represents a dot density dot style object. A dot density dot style object
 * specifies the attribute of the GeoJSON data to divide by the dot value of the
 * layer to produce a discrete number of dots. The size of the dots is constant.
 *
 * @property attribute The attribute of the GeoJSON data to map to
 * the number of dots.
 * @property size The size of the dots.
 * @property value The dot value, representing the ratio of source
 * data units to number of dots.
 */
export interface DotDensityStyle {
  attribute: string;
  value: number;
}

/**
 * Represents a constant heatmap weight style object.
 *
 * @property value The weight of the heatmap.
 */
export interface ConstantHeatmapWeight {
  type: 'Constant';
  value: number;
}

/**
 * Represents a quantitative heatmap weight style object.
 *
 * @property attribute The attribute of the GeoJSON data to map to the
 * weight of the heatmap.
 * @property min The minimum weight of the heatmap.
 * @property max The maximum weight of the heatmap.
 */
export interface QuantitativeHeatmapWeight {
  type: 'Quantitative';
  attribute: string;
  min: number;
  max: number;
}

/**
 * Represents the display style of a heatmap layer.
 *
 * @property weight The weight of the heatmap.
 * @property ramp The color ramp to use for the heatmap.
 * @property radius The radius of the heatmap.
 * @property intensity The intensity of the heatmap.
 * @property opacity The opacity of the heatmap.
 * @property visible Whether the style is visible.
 */
export interface HeatmapStyle {
  weight: ConstantHeatmapWeight | QuantitativeHeatmapWeight;
  ramp: {
    id: QuantitativeColorRamp;
    direction: RampDirection;
  };
  radius: number;
  intensity: number;
  opacity: number;
}

/**
 * Represents a basemap in cartokit.
 *
 * @property title The name of the basemap, set by the tile provider.
 * @property tileId The tile ID of the basemap, set by the tile provider.
 * @property src The source for the basemap thumbnail.
 * @property mode The default mode of the basemap, either 'light' or 'dark'.
 */
export interface Basemap {
  title: string;
  tileId: string;
  src: SvelteHTMLElements['enhanced:img']['src'];
  mode: ThemeMode;
}

/**
 * Represents a dataset gallery item in cartokit.
 */
export interface GalleryItem {
  id: string;
  name: string;
  attribution: string;
  url: string;
  src: SvelteHTMLElements['enhanced:img']['src'];
  type:
    | CartoKitPointLayer['type']
    | CartoKitLineLayer['type']
    | CartoKitPolygonLayer['type'];
}

/**
 * Represents the set of possible basemap providers in cartokit.
 */
export type BasemapProvider =
  | 'CARTO'
  | 'MapTiler'
  | 'Stadia Maps'
  | 'Stamen'
  | 'Custom';

/**
 * Represents the set of possible projections in cartokit.
 */
export type Projection = 'mercator' | 'globe';

/**
 * Represents the cartokit IR.
 *
 * @property center - The current center coordinates of the map.
 * @property zoom - The current zoom level of the map.
 * @property basemap - The current basemap of the map.
 * @property layers - The current layers of the map.
 */
export interface CartoKitIR {
  center: [number, number];
  zoom: number;
  basemap: {
    url: string;
    provider: BasemapProvider;
    mode: ThemeMode;
  };
  projection: Projection;
  layers: Record<string, CartoKitLayer>;
}

/**
 * Represents a catalog mapping layers to pre-computed classification statistics.
 */
export type Catalog = Record<
  CartoKitLayer['id'],
  Record<
    string,
    {
      Quantile: { domain: number[] };
      'Equal Interval': { domain: [number, number] };
      Jenks: Record<number, { breaks: number[] }>;
      min: number;
      max: number;
      unique: number;
    }
  >
>;

/** Represents the set of language backends for code generation. */
type CartoKitLanguageBackend = 'javascript' | 'typescript';

/** Represents the set of library backends for code generation. */
type CartoKitLibraryBackend = 'mapbox' | 'maplibre';

/**
 * Represents the set of identifiers for code generation backends.
 *
 * @property language - The language backend for code generation.
 * @property library - The library backend for code generation.
 */
export interface CartoKitBackend {
  language: CartoKitLanguageBackend;
  library: CartoKitLibraryBackend;
}

/**
 * Represents the analysis information for the CartoKit IR, used by code genera-
 * tion.
 *
 * @property isTurfRequired - A Boolean value indicating whether @turf/turf is
 * required to support cross-geometry transformations.
 * @property isFetchGeoJSONRequired - A Boolean value indicating whether we need
 * to insert a function to fetch GeoJSON hosted at a remote URL.
 * @property isGeoJSONNamespaceRequired - A Boolean value indicating whether we
 * need to insert an import of the GeoJSON namespace.
 */
export interface CartoKitBackendAnalysis extends CartoKitBackend {
  isTurfRequired: boolean;
  isFetchGeoJSONRequired: boolean;
  isGeoJSONNamespaceRequired: boolean;
}

/**
 * Represents the color theme mode.
 */
export type ThemeMode = 'light' | 'dark';
