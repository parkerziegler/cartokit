import type { Map } from 'maplibre-gl';

/**
  * Apply custom naming conventions for basemap labels, overriding definitions from OpenStreetMap.
  * 
  * @param map The top-level {@link Map} instance.
  */
export function applyCustomBasemapLabels(map: Map): void {
  const style = map.getStyle();

  // https://docs.stadiamaps.com/tutorials/changing-place-labels/
  for (const layer of style.layers) {
    if (layer['source-layer'] !== 'water_name') {
      continue;
    }

    layer.layout ??= {};
    const textField = layer.layout['text-field'];
    if (
      textField[2] === 'Sea of Japan / East Sea' &&
      textField[4] === 'East Sea / Sea of Japan'
    ) {
      continue;
    }

    layer.layout['text-field'] = [
      'case',
      ['==', ['id'], 12666169],
      'Sea of Japan / East Sea',
      ['==', ['id'], 9854021782],
      'East Sea / Sea of Japan',
      ['get', 'name:en']
    ];
    const maxWidth = layer.layout?.['text-max-width'] ?? 10;
    layer.layout['text-max-width'] = [
      'case',
      ['in', ['id'], ['literal', [12666169, 9854021782]]],
      30,
      maxWidth
    ];

    map.setStyle(style);
    break;
  }
}
