import type {
  LayerSpecification,
  Map,
  SourceSpecification,
  StyleSpecification
} from 'maplibre-gl';

import type { CartoKitIR } from '$lib/stores/ir';
import { getInstrumentedLayerIds } from '$lib/utils/layer';

interface URLTileConfig {
  kind: 'url';
  url: string;
}

interface JSONTileConfig {
  kind: 'json';
  json: StyleSpecification;
}

export type BasemapSwitchConfig = URLTileConfig | JSONTileConfig;

/**
 * Switch the basemap of the map while preserving all currently renderedlayers
 * and sources. By default, map.setStyle() will remove all layers and sources.
 * See: https://github.com/mapbox/mapbox-gl-js/issues/4006.
 *
 * @param map – The MapLibre map instance.
 * @param ir – The CartoKit IR.
 * @param config – The configuration of the target basemap style.z
 */
export const switchBasemapWithPreservedLayers = async (
  map: Map,
  ir: CartoKitIR,
  config: BasemapSwitchConfig
) => {
  const { layers, sources } = map.getStyle();

  const lyrs = Object.values(ir.layers).reduce<LayerSpecification[]>(
    (acc, layer) => {
      // Get the ids of all layers in the IR in addition to their instrumented layers.
      const ids = [layer.id, ...getInstrumentedLayerIds(layer)];

      // Return the LayerSpecifications of the layers possessing one of the above ids.
      return [
        ...acc,
        ...ids.reduce<LayerSpecification[]>((acc, id) => {
          const lyr = layers.find((lyr) => lyr.id === id);
          if (lyr) {
            acc.push(lyr);
          }

          return acc;
        }, [])
      ];
    },
    []
  );
  const srcs = Object.keys(sources).reduce<Record<string, SourceSpecification>>(
    (acc, src) => {
      if (sources[src]) {
        acc[src] = sources[src];
      }

      return acc;
    },
    {}
  );

  try {
    let style: StyleSpecification;

    if (config.kind === 'url') {
      style = await fetch(config.url).then((res) => res.json());
    } else {
      style = config.json;
    }

    style.layers = [...style.layers, ...lyrs];
    style.sources = { ...style.sources, ...srcs };

    map.setStyle(style);
  } catch (err) {
    console.error('Error switching basemap', err);
  }
};
