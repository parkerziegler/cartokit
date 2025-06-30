import * as d3 from 'd3';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { Map, GeoJSONSource } from 'maplibre-gl';

import { deriveColorScale } from '$lib/interaction/color';
import {
  deriveSize,
  generateDotDensityPoints
} from '$lib/interaction/geometry';
import { deriveThresholds } from '$lib/interaction/scales';
import type {
  CartoKitLayer,
  CartoKitChoroplethLayer,
  CartoKitDotDensityLayer,
  CartoKitProportionalSymbolLayer,
  CartoKitPointLayer,
  Channel
} from '$lib/types';
import { enumerateAttributeCategories } from '$lib/utils/geojson';

/**
 * Update a given visualization channel for a given layer.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitLayer} layer – The layer to update.
 * @param {Channel} channel – The visualization channel to update.
 */
export function updateLayerChannel(
  map: Map,
  layer: CartoKitLayer,
  channel: Channel
): void {
  switch (layer.type) {
    case 'Choropleth':
      updateChoroplethChannel(map, layer, channel);
      break;
    case 'Proportional Symbol':
      updateProportionalSymbolChannel(map, layer, channel);
      break;
    case 'Dot Density':
      updateDotDensityChannel(map, layer, channel);
      break;
    case 'Point':
      updatePointChannel(map, layer, channel);
      break;
    default:
      break;
  }
}

/**
 * Update a visualization channel for a @see{CartoKitChoroplethLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitChoroplethLayer} layer – The layer to update.
 * @param {Channel} channel – The visualization channel to update.
 */
function updateChoroplethChannel(
  map: Map,
  layer: CartoKitChoroplethLayer,
  channel: Channel
): void {
  switch (channel) {
    case 'fill':
      return updateFillChannel(map, layer);
    default:
      break;
  }
}

/**
 * Update a visualization channel for a @see{CartoKitProportionalSymbolLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitProportionalSymbolLayer} layer – The layer to update.
 * @param {Channel} channel – The visualization channel to update.
 */
function updateProportionalSymbolChannel(
  map: Map,
  layer: CartoKitProportionalSymbolLayer,
  channel: Channel
): void {
  switch (channel) {
    case 'size':
      return updateSizeChannel(map, layer);
    case 'fill':
      return updateFillChannel(map, layer);
    default:
      break;
  }
}

/**
 * Update a visualization channel for a @see{CartoKitDotDensityLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitDotDensityLayer} layer – The layer to update.
 * @param {Channel} channel – The visualization channel to update.
 */
function updateDotDensityChannel(
  map: Map,
  layer: CartoKitDotDensityLayer,
  channel: Channel
): void {
  switch (channel) {
    case 'dots':
      return updateDotsChannel(map, layer);
    default:
      break;
  }
}

/**
 * Update a visualization channel for a @see{CartoKitPointLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitPointLayer} layer – The layer to update.
 * @param {Channel} channel – The visualization channel to update.
 */
function updatePointChannel(
  map: Map,
  layer: CartoKitPointLayer,
  channel: Channel
) {
  switch (channel) {
    case 'fill':
      return updateFillChannel(map, layer);
    default:
      break;
  }
}

/**
 * Update the size channel for a @see{CartoKitProportionalSymbolLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitProportionalSymbolLayer} layer – The layer to update.
 */
function updateSizeChannel(
  map: Map,
  layer: CartoKitProportionalSymbolLayer
): void {
  const size = deriveSize(layer);

  map.setPaintProperty(layer.id, 'circle-radius', size);
}

/**
 * Update the fill channel for a @see{CartoKitLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitProportionalSymbolLayer | CartoKitChoroplethLayer} layer –
 * The layer to update.
 */
function updateFillChannel(
  map: Map,
  layer:
    | CartoKitProportionalSymbolLayer
    | CartoKitChoroplethLayer
    | CartoKitPointLayer
): void {
  const property = layer.type === 'Choropleth' ? 'fill-color' : 'circle-color';

  if (layer.style.fill) {
    switch (layer.style.fill.type) {
      case 'Constant':
        break;
      case 'Categorical':
        layer.style.fill.categories = enumerateAttributeCategories(
          layer.data.geojson.features,
          layer.style.fill.attribute
        );
        break;
      case 'Quantitative': {
        const colors = d3[layer.style.fill.scheme.id][layer.style.fill.count];

        layer.style.fill.thresholds = deriveThresholds({
          method: layer.style.fill.method,
          layerId: layer.id,
          attribute: layer.style.fill.attribute,
          range:
            layer.style.fill.scheme.direction === 'Reverse'
              ? [...colors].reverse()
              : [...colors],
          thresholds: layer.style.fill.thresholds
        });
        break;
      }
    }

    map.setPaintProperty(
      layer.id,
      property,
      deriveColorScale(layer.style.fill)
    );
  }
}

/**
 * Update the dots channel for a @see{CartoKitDotDensityLayer}.
 *
 * @param {Map} map – The MapLibre GL JS map instance.
 * @param {CartoKitDotDensityLayer} layer – The layer to update.
 */
function updateDotsChannel(map: Map, layer: CartoKitDotDensityLayer): void {
  const features = generateDotDensityPoints(
    layer.data.sourceGeojson.features as Feature<Polygon | MultiPolygon>[],
    layer.style.dots.attribute,
    layer.style.dots.value
  );

  layer.data.geojson = features;

  // Update the args of the dot density transformation in this layer.
  //
  // Find the transformation call for the dot density transformation.
  const transformationIndex = layer.data.transformations.findIndex(
    (t) => t.name === 'transformDotDensity'
  );

  if (transformationIndex > -1) {
    layer.data.transformations[transformationIndex].args = [
      layer.style.dots.attribute,
      layer.style.dots.value
    ];
  }

  // Update the source with the new data.
  (map.getSource(layer.id) as GeoJSONSource).setData(features);
}
