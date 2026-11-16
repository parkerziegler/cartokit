import type { LayerSpecification } from 'maplibre-gl';

import { codegenFill, codegenStroke } from '#lib/codegen/codegen-paint.ts';
import { literal, prop, props } from '#lib/codegen/utils.ts';
import type { CartoKitLayer } from '#lib/types/index.ts';

interface CodegenAddLayerParams {
  layer: CartoKitLayer;
  type: LayerSpecification['type'];
  paint: string;
  id?: string;
  beforeId?: string;
}

/**
 * Generate a program fragment adding a single rendered layer to the map.
 *
 * @param params The {@link CodegenAddLayerParams}.
 * @param params.layer The {@link CartoKitLayer} being rendered.
 * @param params.type The type of the rendered layer.
 * @param params.paint A (potentially empty) program fragment containing the
 * paint properties of the rendered layer.
 * @param params.id The id of the rendered layer. Defaults to the id of the
 * {@link CartoKitLayer}.
 * @param params.beforeId The id of the layer beneath which to insert this
 * layer.
 * @returns A program fragment containing the call to add the layer.
 */
function codegenAddLayer({
  layer,
  type,
  paint,
  id = layer.id,
  beforeId
}: CodegenAddLayerParams): string {
  const options = props(
    prop('id', id),
    prop('source', layer.id),
    layer.source.type === 'pmtiles'
      ? prop('source-layer', layer.source.sourceLayerId)
      : '',
    prop('type', type),
    paint ? `paint: { ${paint} }` : ''
  );

  // The newline after the opening brace keeps Prettier from collapsing short
  // layer definitions onto a single line.
  return `map.addLayer({
${options}
}${beforeId ? `, ${literal(beforeId)}` : ''});`;
}

/**
 * Generate a program fragment for a {@link CartoKitLayer}.
 *
 * @param layer A {@link CartoKitLayer}.
 * @param beforeId The id of the layer beneath which to insert this layer.
 * @returns A program fragment containing the definition of a layer, with an
 * accompanying call to add the layer to the map.
 */
export function codegenLayer(layer: CartoKitLayer, beforeId?: string): string {
  switch (layer.type) {
    case 'Point':
    case 'Proportional Symbol':
      return codegenAddLayer({
        layer,
        type: 'circle',
        paint: props(codegenFill(layer), codegenStroke(layer)),
        beforeId
      });
    case 'Line':
      return codegenAddLayer({
        layer,
        type: 'line',
        paint: codegenStroke(layer),
        beforeId
      });
    case 'Polygon':
      return [
        layer.style.fill.visible
          ? codegenAddLayer({
              layer,
              type: 'fill',
              paint: codegenFill(layer),
              beforeId
            })
          : '',
        layer.style.stroke.visible
          ? codegenAddLayer({
              layer,
              type: 'line',
              paint: codegenStroke(layer),
              id: `${layer.id}-stroke`,
              beforeId
            })
          : ''
      ]
        .filter(Boolean)
        .join('\n\n');
    case 'Choropleth':
      return [
        codegenAddLayer({
          layer,
          type: 'fill',
          paint: codegenFill(layer),
          beforeId
        }),
        layer.style.stroke.visible
          ? codegenAddLayer({
              layer,
              type: 'line',
              paint: codegenStroke(layer),
              id: `${layer.id}-stroke`,
              beforeId
            })
          : ''
      ]
        .filter(Boolean)
        .join('\n\n');
    case 'Heatmap':
      return codegenAddLayer({
        layer,
        type: 'heatmap',
        paint: codegenFill(layer),
        beforeId
      });
  }
}
