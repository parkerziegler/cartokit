import { json, error } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { ChatCompletionParseParams } from 'openai/resources/chat/completions';
import { z } from 'zod';

import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

import type { BasemapProvider, LayerType } from '$lib/types';
import { BASEMAPS, TILE_URLS } from '$lib/utils/basemap';

// Initialize the OpenAI client.
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY!
});

/**
 * The main function that handles the POST request to the /llm endpoint. This
 * function receives a prompt from a user and sends it to the OpenAI API, re-
 * turning the generated diffs as a JSON response.
 */
export const POST = (async ({ request }) => {
  const {
    model,
    layerIds,
    layerIdsToAttributes,
    layerIdsToSourceLayerIds,
    layerIdsToTypes,
    prompt
  } = await request.json();

  try {
    const completion = await openai.chat.completions.parse<
      ChatCompletionParseParams,
      z.infer<typeof DiffSchema>
    >({
      model,
      reasoning_effort: 'low',
      messages: [
        {
          role: 'system',
          content: `Generate zero or more diffs to apply to the map visualization
      based on the user's prompt. In addition, provide a very terse summary of
      the generated diff sequence, such that a user can understand the set of
      changes to expect. Choose the "unknown" diff if you cannot easily
      determine the type of diff based on the prompt.

      For diffs that require a "layerId" value, consult the following array
      to determine the set of valid strings to use: ${JSON.stringify(layerIds)}.
      When creating new layers with "add-layer", generate friendly layer IDs
      in kebab-case format with a unqiue hash suffix based on the displayName
      (e.g., "population-data__a1b2c3" for a layer named "Population Data"). Use
      the same layer ID when referencing the newly created layer in subsequent
      diffs within the same request, as appropriate.

      When transitioning a layer's type with "layer-type", consult the
      following dictionary to determine the current sourceLayerType for the
      layer targeted by the diff: ${JSON.stringify(layerIdsToTypes)}.

      When generating a diff changing an attribute for a visualization property
      of a layer, consult the following dictionary to determine the available
      attributes on the layer: ${JSON.stringify(layerIdsToAttributes)}.

      When switching a layer's source layer with "source-layer", consult the
      following dictionary to determine the available sourceLayerIds for the
      layer targeted by the diff: ${JSON.stringify(layerIdsToSourceLayerIds)}.`
        },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'diffs',
          strict: true,
          schema: z.toJSONSchema(DiffSchema, {
            target: 'draft-7'
          })
        }
      }
    });

    // Validate the response using information from the map state.
    const LayerIdSchema = makeLayerIdSchema(layerIds);
    const AttributeSchema = makeAttrsSchema(layerIdsToAttributes);
    const SourceLayerIdsSchema = makeSourceLayerIdsSchema(
      layerIdsToSourceLayerIds
    );

    const diffs = completion.choices[0].message.parsed?.diffs.filter((diff) => {
      let layerIdValid = true;
      let attributeValid = true;
      let sourceLayerIdValid = true;

      if ('layerId' in diff) {
        layerIdValid = z.validate(LayerIdSchema, diff.layerId);
      }

      if ('attribute' in diff.payload) {
        attributeValid = z.validate(AttributeSchema, diff.payload.attribute);
      }

      if (diff.type === 'source-layer') {
        sourceLayerIdValid =
          z.validate(SourceLayerIdsSchema, diff.payload.sourceSourceLayerId) &&
          z.validate(SourceLayerIdsSchema, diff.payload.targetSourceLayerId);
      }

      return layerIdValid && attributeValid && sourceLayerIdValid;
    });

    return json({
      diffs: diffs ?? [],
      summary: completion.choices[0].message.parsed?.summary ?? ''
    });
  } catch (err) {
    console.error(err);

    return error(500, {
      message: 'Internal server error'
    });
  }
}) satisfies RequestHandler;

/**
 * Construct the schema for the layerId field for a diff.
 *
 * Constrained decoding responses from the OpenAI API should only target
 * existing map layers. This schema also permits a fresh layer ID subschema to
 * support the "add-layer" diff, which must generate a layer ID on the fly.
 *
 * @param layerIds An array of the IDs of the current layers on the map.
 * @returns A Zod schema for the layerId field of a generated diff.
 */
function makeLayerIdSchema(layerIds: string[]) {
  const freshLayerIdSchema = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*__[a-z0-9]+$/);

  if (layerIds.length === 0) {
    return freshLayerIdSchema;
  }

  return z.union([
    z.literal(layerIds[0]),
    freshLayerIdSchema,
    ...layerIds.slice(1).map((id) => z.literal(id))
  ]);
}

/**
 * Construct the schema for a dataset attribute, potentially present in the
 * payload of a diff.
 *
 * Constrained decoding responses from the OpenAI API should only reference
 * attributes that exist on the map's layers. If no layers expose attributes,
 * the schema falls back to the "None" sentinel.
 *
 * @param layerIdsToAttributes A dictionary mapping the IDs of the current
 * map layers to their available attributes.
 * @returns A Zod schema for the attribute field of a generated diff.
 */
function makeAttrsSchema(layerIdsToAttributes: Record<string, string[]>) {
  const attrs = Object.values(layerIdsToAttributes).flat();

  switch (attrs.length) {
    case 0:
      return z.literal('None');
    case 1:
      return z.literal(attrs[0]);
    default:
      return z.union([
        z.literal(attrs[0]),
        z.literal(attrs[1]),
        ...attrs.slice(2).map((attr) => z.literal(attr))
      ]);
  }
}

/**
 * Construct the schema for a source layer ID, present in the payload of the
 * "source-layer" diff.
 *
 * Constrained decoding responses from the OpenAI API should only reference
 * source layers that exist on the map's current vector layers. If no layers
 * expose source layer IDs, the schema falls back to the "None" sentinel.
 *
 * @param layerIdsToSourceLayerIds A dictionary mapping the IDs of the current
 * map layers to their available source layers.
 * @returns A Zod schema for the sourceSoucrceLayerId or targetSourceLayerId
 * field of a generated "source-layer" diff.
 */
function makeSourceLayerIdsSchema(
  layerIdsToSourceLayerIds: Record<string, string[]>
) {
  const sourceLayerIds = Object.values(layerIdsToSourceLayerIds).flat();

  switch (sourceLayerIds.length) {
    case 0:
      return z.literal('None');
    case 1:
      return z.literal(sourceLayerIds[0]);
    default:
      return z.union([
        z.literal(sourceLayerIds[0]),
        z.literal(sourceLayerIds[1]),
        ...sourceLayerIds.slice(2).map((id) => z.literal(id))
      ]);
  }
}

const LayerType = z.union([
  z.literal('Choropleth'),
  z.literal('Dot Density'),
  z.literal('Heatmap'),
  z.literal('Line'),
  z.literal('Point'),
  z.literal('Polygon'),
  z.literal('Proportional Symbol')
]);

const LayerTypeDiff = z.object({
  type: z.literal('layer-type'),
  layerId: z.string(),
  payload: z.object({
    sourceLayerType: LayerType,
    targetLayerType: LayerType
  })
});

const SourceLayerDiff = z.object({
  type: z.literal('source-layer'),
  layerId: z.string(),
  payload: z.object({
    sourceSourceLayerId: z.string(),
    targetSourceLayerId: z.string()
  })
});

const FillAttributeDiff = z.object({
  type: z.literal('fill-attribute'),
  layerId: z.string(),
  payload: z.object({
    attribute: z.string()
  })
});

const FillColorDiff = z.object({
  type: z.literal('fill-color'),
  layerId: z.string(),
  payload: z.object({
    color: z.string()
  })
});

const FillColorSchemeDiff = z.object({
  type: z.literal('fill-color-scheme'),
  layerId: z.string(),
  payload: z.object({
    scheme: z.union([
      z.literal('schemeBlues'),
      z.literal('schemeGreens'),
      z.literal('schemeGreys'),
      z.literal('schemeOranges'),
      z.literal('schemePurples'),
      z.literal('schemeReds'),
      z.literal('schemeBuGn'),
      z.literal('schemeBuPu'),
      z.literal('schemeGnBu'),
      z.literal('schemeOrRd'),
      z.literal('schemePuBuGn'),
      z.literal('schemePuBu'),
      z.literal('schemePuRd'),
      z.literal('schemeRdPu'),
      z.literal('schemeYlGnBu'),
      z.literal('schemeYlGn'),
      z.literal('schemeYlOrBr'),
      z.literal('schemeYlOrRd'),
      z.literal('schemeBrBG'),
      z.literal('schemePRGn'),
      z.literal('schemePiYG'),
      z.literal('schemePuOr'),
      z.literal('schemeRdBu'),
      z.literal('schemeRdGy'),
      z.literal('schemeRdYlBu'),
      z.literal('schemeRdYlGn'),
      z.literal('schemeSpectral'),
      z.literal('schemeCategory10'),
      z.literal('schemeAccent'),
      z.literal('schemeDark2'),
      z.literal('schemeObservable10'),
      z.literal('schemePaired'),
      z.literal('schemePastel1'),
      z.literal('schemePastel2'),
      z.literal('schemeSet1'),
      z.literal('schemeSet2'),
      z.literal('schemeSet3'),
      z.literal('schemeTableau10')
    ])
  })
});

const FillColorSchemeDirectionDiff = z.object({
  type: z.literal('fill-color-scheme-direction'),
  layerId: z.string(),
  payload: z.object({
    direction: z.union([z.literal('Forward'), z.literal('Reverse')])
  })
});

const QuantitativeColorRamp = z.union([
  z.literal('interpolateBlues'),
  z.literal('interpolateGreens'),
  z.literal('interpolateGreys'),
  z.literal('interpolateOranges'),
  z.literal('interpolatePurples'),
  z.literal('interpolateReds'),
  z.literal('interpolateBuGn'),
  z.literal('interpolateBuPu'),
  z.literal('interpolateGnBu'),
  z.literal('interpolateOrRd'),
  z.literal('interpolatePuBuGn'),
  z.literal('interpolatePuBu'),
  z.literal('interpolatePuRd'),
  z.literal('interpolateRdPu'),
  z.literal('interpolateYlGnBu'),
  z.literal('interpolateYlGn'),
  z.literal('interpolateYlOrBr'),
  z.literal('interpolateYlOrRd'),
  z.literal('interpolateCividis'),
  z.literal('interpolateViridis'),
  z.literal('interpolateInferno'),
  z.literal('interpolateMagma'),
  z.literal('interpolatePlasma'),
  z.literal('interpolateWarm'),
  z.literal('interpolateCool'),
  z.literal('interpolateCubehelixDefault'),
  z.literal('interpolateTurbo'),
  z.literal('interpolateBrBG'),
  z.literal('interpolatePRGn'),
  z.literal('interpolatePiYG'),
  z.literal('interpolatePuOr'),
  z.literal('interpolateRdBu'),
  z.literal('interpolateRdGy'),
  z.literal('interpolateRdYlBu'),
  z.literal('interpolateRdYlGn'),
  z.literal('interpolateSpectral'),
  z.literal('interpolateRainbow'),
  z.literal('interpolateSinebow')
]);

const FillColorRampDiff = z.object({
  type: z.literal('fill-color-ramp'),
  layerId: z.string(),
  payload: z.object({ ramp: QuantitativeColorRamp })
});

const FillColorRampDirectionDiff = z.object({
  type: z.literal('fill-color-ramp-direction'),
  layerId: z.string(),
  payload: z.object({
    direction: z.union([z.literal('Forward'), z.literal('Reverse')])
  })
});

const ClassificationMethod = z.union([
  z.literal('Quantile'),
  z.literal('Equal Interval'),
  z.literal('Jenks'),
  z.literal('Manual')
]);

const FillClassificationMethodDiff = z.object({
  type: z.literal('fill-classification-method'),
  layerId: z.string(),
  payload: z.object({
    method: ClassificationMethod
  })
});

const FillStepCountDiff = z.object({
  type: z.literal('fill-step-count'),
  layerId: z.string(),
  payload: z.object({
    count: z.number().min(3).max(9)
  })
});

const FillStepValueDiff = z.object({
  type: z.literal('fill-step-value'),
  layerId: z.string(),
  payload: z.object({
    step: z.number().min(0),
    value: z.number()
  })
});

const VisualizationType = z.union([
  z.literal('Quantitative'),
  z.literal('Categorical'),
  z.literal('Constant')
]);

const FillVisualizationTypeDiff = z.object({
  type: z.literal('fill-visualization-type'),
  layerId: z.string(),
  payload: z.object({
    visualizationType: VisualizationType
  })
});

const FillOpacityDiff = z.object({
  type: z.literal('fill-opacity'),
  layerId: z.string(),
  payload: z.object({
    opacity: z.number().min(0).max(1)
  })
});

const AddFillDiff = z.object({
  type: z.literal('add-fill'),
  layerId: z.string(),
  payload: z.object({})
});

const RemoveFillDiff = z.object({
  type: z.literal('remove-fill'),
  layerId: z.string(),
  payload: z.object({})
});

const StrokeColorDiff = z.object({
  type: z.literal('stroke-color'),
  layerId: z.string(),
  payload: z.object({
    color: z.string()
  })
});

const StrokeWidthDiff = z.object({
  type: z.literal('stroke-width'),
  layerId: z.string(),
  payload: z.object({
    strokeWidth: z.number().min(0)
  })
});

const StrokeOpacityDiff = z.object({
  type: z.literal('stroke-opacity'),
  layerId: z.string(),
  payload: z.object({
    opacity: z.number().min(0).max(1)
  })
});

const AddStrokeDiff = z.object({
  type: z.literal('add-stroke'),
  layerId: z.string(),
  payload: z.object({})
});

const RemoveStrokeDiff = z.object({
  type: z.literal('remove-stroke'),
  layerId: z.string(),
  payload: z.object({})
});

const SizeAttributeDiff = z.object({
  type: z.literal('size-attribute'),
  layerId: z.string(),
  payload: z.object({
    attribute: z.string()
  })
});

const SizeDiff = z.object({
  type: z.literal('size'),
  layerId: z.string(),
  payload: z.object({
    size: z.number().min(0)
  })
});

const MinSizeDiff = z.object({
  type: z.literal('min-size'),
  layerId: z.string(),
  payload: z.object({
    minSize: z.number().min(0)
  })
});

const MaxSizeDiff = z.object({
  type: z.literal('max-size'),
  layerId: z.string(),
  payload: z.object({
    maxSize: z.number().min(0)
  })
});

const DotValueDiff = z.object({
  type: z.literal('dot-value'),
  layerId: z.string(),
  payload: z.object({ value: z.number().min(0) })
});

const DotAttributeDiff = z.object({
  type: z.literal('dot-attribute'),
  layerId: z.string(),
  payload: z.object({ attribute: z.string() })
});

const HeatmapOpacityDiff = z.object({
  type: z.literal('heatmap-opacity'),
  layerId: z.string(),
  payload: z.object({ opacity: z.number().min(0).max(1) })
});

const HeatmapRadiusDiff = z.object({
  type: z.literal('heatmap-radius'),
  layerId: z.string(),
  payload: z.object({ radius: z.number().min(0) })
});

const HeatmapRampDiff = z.object({
  type: z.literal('heatmap-ramp'),
  layerId: z.string(),
  payload: z.object({
    ramp: z.union([
      z.literal('Cividis'),
      z.literal('Viridis'),
      z.literal('Inferno'),
      z.literal('Magma'),
      z.literal('Plasma'),
      z.literal('Warm'),
      z.literal('Cool'),
      z.literal('CubehelixDefault'),
      z.literal('Turbo'),
      z.literal('Spectral'),
      z.literal('Rainbow'),
      z.literal('Sinebow')
    ])
  })
});

const HeatmapRampDirectionDiff = z.object({
  type: z.literal('heatmap-ramp-direction'),
  layerId: z.string(),
  payload: z.object({
    direction: z.union([z.literal('Forward'), z.literal('Reverse')])
  })
});

const HeatmapWeightTypeDiff = z.object({
  type: z.literal('heatmap-weight-type'),
  layerId: z.string(),
  payload: z.object({
    weightType: z.union([z.literal('Constant'), z.literal('Quantitative')])
  })
});

const HeatmapWeightAttributeDiff = z.object({
  type: z.literal('heatmap-weight-attribute'),
  layerId: z.string(),
  payload: z.object({
    attribute: z.string()
  })
});

const HeatmapWeightMinDiff = z.object({
  type: z.literal('heatmap-weight-min'),
  layerId: z.string(),
  payload: z.object({
    min: z.number()
  })
});

const HeatmapWeightMaxDiff = z.object({
  type: z.literal('heatmap-weight-max'),
  layerId: z.string(),
  payload: z.object({
    max: z.number()
  })
});

const HeatmapWeightValueDiff = z.object({
  type: z.literal('heatmap-weight-value'),
  layerId: z.string(),
  payload: z.object({ value: z.number().min(0) })
});

const LayerVisibilityDiff = z.object({
  type: z.literal('layer-visibility'),
  layerId: z.string(),
  payload: z.object({ visible: z.boolean() })
});

const LayerTooltipVisibilityDiff = z.object({
  type: z.literal('layer-tooltip-visibility'),
  layerId: z.string(),
  payload: z.object({ visible: z.boolean() })
});

const APILocation = z.object({
  type: z.literal('api'),
  url: z.string()
});

const GeoJSONLayerPayload = z.object({
  type: z.literal('geojson'),
  displayName: z.string(),
  location: APILocation
});

const VectorLayerPayload = z.object({
  type: z.literal('vector'),
  displayName: z.string(),
  location: APILocation
});

const AddLayerDiff = z.object({
  type: z.literal('add-layer'),
  layerId: z.string(),
  payload: z.union([GeoJSONLayerPayload, VectorLayerPayload])
});

const RemoveLayerDiff = z.object({
  type: z.literal('remove-layer'),
  layerId: z.string(),
  payload: z.object({
    sourceLayerType: LayerType
  })
});

const RenameLayerDiff = z.object({
  type: z.literal('rename-layer'),
  layerId: z.string(),
  payload: z.object({ displayName: z.string() })
});

const Basemap = z.union(
  Object.entries(BASEMAPS).flatMap(([provider, basemaps]) => {
    return basemaps.map((basemap) =>
      z.object({
        provider: z.literal(provider),
        url: z.literal(TILE_URLS[provider as BasemapProvider](basemap.tileId)),
        mode: z.literal(basemap.mode)
      })
    );
  })
);

const BasemapDiff = z.object({
  type: z.literal('basemap'),
  payload: Basemap
});

const ZoomDiff = z.object({
  type: z.literal('zoom'),
  payload: z.object({ zoom: z.number().min(0).max(22) })
});

const CenterDiff = z.object({
  type: z.literal('center'),
  payload: z.object({
    center: z.object({
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90)
    })
  })
});

const ProjectionDiff = z.object({
  type: z.literal('projection'),
  payload: z.object({
    projection: z.union([z.literal('mercator'), z.literal('globe')])
  })
});

const UnknownDiff = z.object({
  type: z.literal('unknown'),
  layerId: z.string(),
  payload: z.object({})
});

const DiffSchema = z.object({
  diffs: z.array(
    z.union([
      LayerTypeDiff,
      SourceLayerDiff,
      FillAttributeDiff,
      FillColorDiff,
      FillColorSchemeDiff,
      FillColorSchemeDirectionDiff,
      FillColorRampDiff,
      FillColorRampDirectionDiff,
      FillClassificationMethodDiff,
      FillStepCountDiff,
      FillStepValueDiff,
      FillVisualizationTypeDiff,
      FillOpacityDiff,
      AddFillDiff,
      RemoveFillDiff,
      StrokeColorDiff,
      StrokeWidthDiff,
      StrokeOpacityDiff,
      AddStrokeDiff,
      RemoveStrokeDiff,
      SizeAttributeDiff,
      SizeDiff,
      MinSizeDiff,
      MaxSizeDiff,
      DotValueDiff,
      DotAttributeDiff,
      HeatmapOpacityDiff,
      HeatmapRadiusDiff,
      HeatmapRampDiff,
      HeatmapRampDirectionDiff,
      HeatmapWeightTypeDiff,
      HeatmapWeightAttributeDiff,
      HeatmapWeightMinDiff,
      HeatmapWeightMaxDiff,
      HeatmapWeightValueDiff,
      LayerVisibilityDiff,
      LayerTooltipVisibilityDiff,
      AddLayerDiff,
      RemoveLayerDiff,
      RenameLayerDiff,
      BasemapDiff,
      ZoomDiff,
      CenterDiff,
      ProjectionDiff,
      UnknownDiff
    ])
  ),
  summary: z.string()
});
