import type { CartoKitIR, CartoKitLayer } from '$lib/types';

/**
 * Represents the set of models cartokit supports prompting. This is the source
 * of truth for the model picker in the chat UI and for validating the model
 * requested by a client of the /llm endpoint.
 */
export type LLM = 'gpt-5.6-luna' | 'gpt-5.6-terra' | 'gpt-5.6-sol';

/**
 * Represents a summary of a single {@link CartoKitLayer}, sent to the /llm
 * endpoint as part of an {@link LLMRequestState}. This is a lossy projection
 * of a layer — enough for a model to target the layer and reason about which
 * diffs apply to it, without serializing its source data or its full style.
 *
 * @property attributes - The attribute names available on the layer's source.
 * @property sourceLayerIds - The source layer IDs available on the layer's
 * source; empty for layers not backed by a vector source.
 */
export type LLMRequestStateLayer = Omit<CartoKitLayer, 'source' | 'style'> & {
  attributes: string[];
  sourceLayerIds: string[];
};

/**
 * Represents a summary of the current state of the map, sent to the /llm
 * endpoint to ground diff generation. Mirrors the {@link CartoKitIR}, save for
 * its layers, which are flattened into an array of
 * {@link LLMRequestStateLayer} in draw order.
 *
 * Every map property the model can target with a diff should be represented
 * here; without it, the model cannot resolve relative requests ("zoom in a
 * bit", "make the basemap darker").
 */
export type LLMRequestState = Omit<CartoKitIR, 'layers'> & {
  layers: LLMRequestStateLayer[];
};

/**
 * Represents the body of a POST request to the /llm endpoint.
 *
 * @property model - The {@link LLM} to prompt.
 * @property prompt - The user's natural language description of the edit.
 * @property requestState - The current {@link LLMRequestState} of the map being
 * edited.
 */
export interface LLMRequest {
  model: LLM;
  prompt: string;
  requestState: LLMRequestState;
}
