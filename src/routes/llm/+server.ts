import { json, error } from '@sveltejs/kit';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionParseParams
} from 'openai/resources/chat/completions';
import { z } from 'zod';

import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

import type { BasemapProvider, LayerType } from '$lib/types';
import type { LLMRequest, LLMRequestState, Prompt } from '$lib/types/llm';
import { BASEMAPS, TILE_URLS } from '$lib/utils/basemap';

// Initialize the OpenAI client.
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY!
});

/**
 * Diffs that apply to the map instance.
 */
const MAP_DIFFs = ['center', 'zoom', 'basemap', 'projection'];

/**
 * Diffs accepted by every layer, regardless of its {@link LayerType}.
 */
const LAYER_DIFFS = [
  'layer-type',
  'layer-visibility',
  'layer-tooltip-visibility',
  'rename-layer',
  'remove-layer'
];

/**
 * Diifs specific to each layer, based on its {@link LayerType}.
 */
const LAYER_TYPE_DIFFS: Record<LayerType, string[]> = {
  Choropleth: [
    'fill-attribute',
    'fill-visualization-type',
    'fill-classification-method',
    'fill-color-ramp',
    'fill-color-ramp-direction',
    'fill-color-scheme',
    'fill-color-scheme-direction',
    'fill-step-count',
    'fill-step-value',
    'fill-opacity',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'add-stroke',
    'remove-stroke'
  ],
  'Dot Density': [
    'fill-color',
    'fill-opacity',
    'add-fill',
    'remove-fill',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'add-stroke',
    'remove-stroke',
    'size',
    'dot-attribute',
    'dot-value'
  ],
  Heatmap: [
    'heatmap-ramp',
    'heatmap-ramp-direction',
    'heatmap-radius',
    'heatmap-opacity',
    'heatmap-weight-type',
    'heatmap-weight-attribute',
    'heatmap-weight-min',
    'heatmap-weight-max',
    'heatmap-weight-value'
  ],
  Line: ['stroke-color', 'stroke-width', 'stroke-opacity'],
  Point: [
    'fill-attribute',
    'fill-color',
    'fill-classification-method',
    'fill-color-ramp',
    'fill-color-ramp-direction',
    'fill-color-scheme',
    'fill-color-scheme-direction',
    'fill-step-count',
    'fill-step-value',
    'fill-opacity',
    'add-fill',
    'remove-fill',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'add-stroke',
    'remove-stroke',
    'size'
  ],
  Polygon: [
    'fill-color',
    'fill-opacity',
    'add-fill',
    'remove-fill',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'add-stroke',
    'remove-stroke'
  ],
  'Proportional Symbol': [
    'fill-attribute',
    'fill-visualization-type',
    'fill-classification-method',
    'fill-color',
    'fill-color-ramp',
    'fill-color-ramp-direction',
    'fill-color-scheme',
    'fill-color-scheme-direction',
    'fill-step-count',
    'fill-step-value',
    'fill-opacity',
    'add-fill',
    'remove-fill',
    'stroke-color',
    'stroke-width',
    'stroke-opacity',
    'add-stroke',
    'remove-stroke',
    'size-attribute',
    'min-size',
    'max-size'
  ]
};

/**
 * The static portion of the system prompt, held constant to support caching
 * across requests.
 */
const SYSTEM_PROMPT = `You are the editing assistant for cartokit, a browser-based cartography tool. The user is looking at a map and describing changes to it in natural language. Translate their request into an ordered sequence of diffs that the application will apply to the map.

## Diffs

A diff is a single, atomic edit. Layer-scoped diffs carry a "layerId" naming the layer they target. Map-scoped diffs ("${MAP_DIFFs.join('", "')}") apply to the map as a whole and target no layer.

Emit diffs in the order they should be applied. A later diff may depend on the effect of an earlier one — for example, converting a layer with "layer-type" before styling the result.

## Layer types

Every layer has a type, and only some diffs are valid for each type. Never emit a diff for a layer whose type does not accept it.

Every layer accepts: ${LAYER_DIFFS.join(', ')}. A layer backed by a vector source also accepts "source-layer".

Beyond those, each layer type accepts:

${Object.entries(LAYER_TYPE_DIFFS)
  .map(([layerType, diffTypes]) => `- ${layerType}: ${diffTypes.join(', ')}`)
  .join('\n')}

## Adding Layers

A user may ask you to add layers by finding a publically-available geospatial dataset on the internet. When adding layers from a remote API endpoint, do your best to validate that the endpoint returns either GeoJSON data (for "add-layer" diffs with payload.location.type = "geojson") or a PMTiles archive (for "add-layer" diffs with payload.location.type = "vector").

## Conversation

Earlier turns of this conversation appear before the map request state: the user's prompt, followed by the JSON you returned for it. A diff marked "errored": true failed to apply.

The map request state reflects the map as it is now — after every earlier turn, and after any edits the user made directly through the interface. Use earlier turns to resolve references such as "that layer", "the same color", "do it again" or "undo that", never as a description of the current map. Where an earlier turn and the map request state disagree, the map request state is correct.

## Rules

- Target layers by the "id" given in the map request state, never by display name. If the user names a layer ambiguously and more than one layer could match, do not guess.
- Only reference attributes listed for the layer you are targeting. An attribute present on one layer does not exist on every layer.
- When creating a layer with "add-layer", generate a layer ID in kebab-case from the display name, followed by a double underscore and a random six-character alphanumeric suffix (for example, "population-data__a1b2c3" for "Population Data"). Reference that same ID in any later diffs in the same response.
- If you cannot determine what the user wants, emit a single "unknown" diff and nothing else, then use the summary to explain what was ambiguous.

## Summary

Alongside the diffs, return a terse, past-tense summary of what changed, so the user knows what to expect — for example, "Converted the counties layer to a choropleth of median income." If you emitted no diffs, or only an "unknown" diff, use the summary to explain why instead.`;

/**
 * Convert the completed turns of the conversation into messages, replaying
 * each as the user's prompt followed by the JSON the model returned for it.
 *
 * These messages sit between the static system prompt and the request state,
 * rather than after them. Completed turns never change, so ordering them this
 * way keeps the cacheable prefix of the request growing with the conversation
 * instead of pinning it to the system prompt alone.
 *
 * @param history The completed turns of the conversation, oldest first.
 * @returns The messages to replay ahead of the current request state.
 */
function buildHistoryMessages(history: Prompt[]): ChatCompletionMessageParam[] {
  return history.flatMap((turn) => [
    { role: 'user', content: turn.text },
    {
      role: 'assistant',
      content: JSON.stringify({ diffs: turn.diffs, summary: turn.summary })
    }
  ]);
}

/**
 * Convert the current requestState of the map to a secondary system prompt.
 *
 * @param requestState The {@link LLMRequestState} supplied by the client.
 * @returns A prompt fragment describing the map the user is looking at.
 */
function buildRequestStatePrompt(requestState: LLMRequestState): string {
  const [lng, lat] = requestState.center;

  const layers =
    requestState.layers.length > 0
      ? requestState.layers
          .map((layer) =>
            [
              `- id: ${layer.id}`,
              `  displayName: ${layer.displayName}`,
              `  type: ${layer.type}`,
              `  attributes: ${layer.attributes.join(', ') || '(none)'}`,
              ...(layer.sourceLayerIds.length > 0
                ? [`  sourceLayerIds: ${layer.sourceLayerIds.join(', ')}`]
                : []),
              `  visible: ${layer.layout.visible}`,
              `  tooltipVisible: ${layer.layout.tooltip.visible}`
            ].join('\n')
          )
          .join('\n')
      : '(the map has no layers)';

  return `# Current map request state

Zoom: ${requestState.zoom}
Center: lng ${lng}, lat ${lat}
Projection: ${requestState.projection}
Basemap: ${requestState.basemap.provider}, ${requestState.basemap.mode} mode

Layers, in draw order:
${layers}`;
}

/**
 * The main function that handles the POST request to the /llm endpoint. This
 * function receives a prompt from a user and sends it to the OpenAI API, re-
 * turning the generated diffs as a JSON response.
 */
export const POST = (async ({ request }) => {
  const { model, prompt, requestState, history }: LLMRequest =
    await request.json();

  try {
    const completion = await openai.chat.completions.parse<
      ChatCompletionParseParams,
      z.infer<typeof DiffSchema>
    >({
      model,
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...buildHistoryMessages(history),
        { role: 'system', content: buildRequestStatePrompt(requestState) },
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

    // Validate the response using information from the map request state.
    const LayerIdSchema = makeLayerIdSchema(
      requestState.layers.map((layer) => layer.id)
    );
    const attrsSchemas = new Map(
      requestState.layers.map((layer) => [
        layer.id,
        makeAttrsSchema(layer.attributes)
      ])
    );
    const sourceLayerIdsSchemas = new Map(
      requestState.layers.map((layer) => [
        layer.id,
        makeSourceLayerIdsSchema(layer.sourceLayerIds)
      ])
    );

    const diffs = completion.choices[0].message.parsed?.diffs.filter((diff) => {
      // Map-scoped diffs target no layer, and so have nothing to validate.
      if (!('layerId' in diff)) {
        return true;
      }

      if (!z.validate(LayerIdSchema, diff.layerId)) {
        return false;
      }

      const AttributeSchema = attrsSchemas.get(diff.layerId);
      const SourceLayerIdsSchema = sourceLayerIdsSchemas.get(diff.layerId);

      if (
        AttributeSchema &&
        'attribute' in diff.payload &&
        !z.validate(AttributeSchema, diff.payload.attribute)
      ) {
        return false;
      }

      if (SourceLayerIdsSchema && diff.type === 'source-layer') {
        return (
          z.validate(SourceLayerIdsSchema, diff.payload.sourceSourceLayerId) &&
          z.validate(SourceLayerIdsSchema, diff.payload.targetSourceLayerId)
        );
      }

      return true;
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
 * Responses from the OpenAI API are validated after the fact, and should only
 * target existing map layers. This schema also permits a fresh layer ID
 * subschema to support the "add-layer" diff, which must generate a layer ID on
 * the fly.
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
 * Responses from the OpenAI API are validated after the fact — the JSON schema
 * sent to the API is static, so it cannot constrain decoding to the attributes
 * of a particular layer. Build one schema per layer, since an attribute
 * present on one layer does not necessarily exist on another. If the layer
 * exposes no attributes, the schema falls back to the "None" sentinel, which
 * rejects every attribute.
 *
 * @param attributes The attributes available on a single map layer.
 * @returns A Zod schema for the attribute field of a diff targeting that layer.
 */
function makeAttrsSchema(attributes: string[]) {
  const attrs = [...new Set(attributes)];

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
 * Responses from the OpenAI API are validated after the fact. Build one schema
 * per layer, since the source layers of one vector layer are unrelated to
 * those of another. A layer not backed by a vector source exposes no source
 * layer IDs, so its schema falls back to the "None" sentinel, which rejects
 * every "source-layer" diff targeting it.
 *
 * @param ids The source layer IDs available on a single map layer.
 * @returns A Zod schema for the sourceSourceLayerId or targetSourceLayerId
 * field of a "source-layer" diff targeting that layer.
 */
function makeSourceLayerIdsSchema(ids: string[]) {
  const sourceLayerIds = [...new Set(ids)];

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

const LayerTypeSchema = z.union([
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
    sourceLayerType: LayerTypeSchema,
    targetLayerType: LayerTypeSchema
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
    sourceLayerType: LayerTypeSchema
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
