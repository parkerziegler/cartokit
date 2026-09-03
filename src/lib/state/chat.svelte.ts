import type { CartoKitDiff } from '$lib/core/diff';
import type { LLM } from '$lib/types/llm';

export interface Prompt {
  id: string;
  text: string;
  diffs: (CartoKitDiff & { errored?: boolean })[];
  summary: string;
}

export const MODELS: { value: LLM; label: string }[] = [
  { value: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
  { value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
  { value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' }
];

export const chat = $state<{
  enable: boolean;
  model: LLM;
  prompt: string;
  dialog: Prompt[];
}>({
  enable: false,
  model: MODELS[0].value,
  prompt: '',
  dialog: []
});
