<script lang="ts">
  import { uniqueId } from 'lodash-es';
  import { onMount, tick } from 'svelte';

  import ChatDialog from '$lib/components/chat/ChatDialog.svelte';
  import ArrowUpIcon from '$lib/components/icons/ArrowUpIcon.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { chat, MODELS } from '$lib/state/chat.svelte';
  import { user } from '$lib/state/user.svelte';
  import { ir } from '$lib/stores/ir';
  import type { LayerType } from '$lib/types';
  import { selectAttributes } from '$lib/utils/attributes';

  interface Props {
    ref?: HTMLDivElement;
    requestInFlight: boolean;
  }

  let {
    ref = $bindable(undefined),
    requestInFlight = $bindable(false)
  }: Props = $props();

  let chatDialog: HTMLDivElement | undefined = $state();
  let textarea: HTMLTextAreaElement | undefined = $state();

  let layerIds = $derived(Object.keys($ir.layers));
  let layerIdsToTypes = $derived(
    Object.entries($ir.layers).reduce<Record<string, LayerType>>(
      (acc, [layerId, layer]) => {
        acc[layerId] = layer.type;
        return acc;
      },
      {}
    )
  );
  let layerIdsToAttributes = $derived(
    Object.entries($ir.layers).reduce<Record<string, string[]>>(
      (acc, [layerId, layer]) => {
        acc[layerId] = selectAttributes(layer.source);

        return acc;
      },
      {}
    )
  );
  let layerIdsToSourceLayerIds = $derived(
    Object.entries($ir.layers).reduce<Record<string, string[]>>(
      (acc, [layerId, layer]) => {
        if (layer.source.type === 'vector') {
          acc[layerId] = layer.source.vectorLayers.map(({ id }) => id);
        }

        return acc;
      },
      {}
    )
  );

  onMount(() => {
    textarea?.focus();
  });

  function onKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }
  ) {
    if (event.key === 'Enter' && !event.shiftKey && chat.prompt.length > 0) {
      onSubmit(event);
    }
  }

  function onModelChange(event: Event & { currentTarget: HTMLSelectElement }) {
    chat.model = event.currentTarget.value;
  }

  async function scrollToBottom() {
    await tick();
    chatDialog?.scrollTo({
      top: chatDialog.scrollHeight,
      behavior: 'smooth'
    });
  }

  async function onSubmit(
    event: Event & {
      currentTarget: EventTarget & (HTMLFormElement | HTMLTextAreaElement);
    }
  ) {
    event.preventDefault();

    requestInFlight = true;

    if (textarea) {
      textarea.blur();
    }

    try {
      chat.dialog.push({
        id: uniqueId('prompt__'),
        text: chat.prompt,
        diffs: [],
        summary: 'Thinking'
      });

      await scrollToBottom();

      const body = JSON.stringify({
        layerIds,
        layerIdsToAttributes,
        layerIdsToSourceLayerIds,
        layerIdsToTypes,
        model: chat.model,
        prompt: chat.prompt,
        userId: user.userId
      });

      // Clear the prompt before issuing the request for animation choreography.
      chat.prompt = '';

      const data = await fetch('/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }).then((response) => response.json());

      for (const diff of data.diffs) {
        if (diff.type === 'unknown') {
          continue;
        } else {
          try {
            await applyDiff(diff);
          } catch {
            diff.errored = true;
          }
        }
      }

      const activePrompt = chat.dialog.at(-1)!;
      activePrompt.diffs = data.diffs;
      activePrompt.summary = data.summary;

      await scrollToBottom();
    } catch {
      const activePrompt = chat.dialog.at(-1)!;
      activePrompt.diffs.push({
        type: 'error',
        payload: {},
        errored: true
      });
      activePrompt.summary =
        'An error occurred while processing the request. Please retry.';
    } finally {
      requestInFlight = false;
    }
  }
</script>

<Menu
  bind:ref
  class="absolute bottom-16 left-1/2 flex max-h-80 -translate-x-1/2 flex-col overflow-hidden p-2"
>
  {#if chat.dialog.length > 0}
    <ChatDialog bind:ref={chatDialog} />
  {/if}
  <div
    class={[
      'flex flex-col gap-2 rounded-sm border border-slate-600',
      { 'rounded-t-none': chat.dialog.length > 0 }
    ]}
  >
    <form class="flex flex-col gap-2" onsubmit={onSubmit}>
      <textarea
        class={[
          'h-14 w-96 resize-none bg-slate-900 p-2 text-white',
          chat.dialog.length === 0
            ? 'rounded-sm rounded-b-none'
            : 'rounded-none'
        ]}
        placeholder="Prompt the model to update the map..."
        bind:value={chat.prompt}
        bind:this={textarea}
        disabled={requestInFlight}
        onkeydown={onKeyDown}></textarea>
      <div class="flex items-center justify-between px-1 pb-1">
        <Select
          class="flex items-center justify-center rounded-xs p-1! font-mono text-xs text-white hover:border-transparent hover:bg-slate-800 focus:border-transparent"
          id="chat-model"
          selected={chat.model}
          options={MODELS}
          onchange={onModelChange}
        />
        <button
          class="flex h-5.5 w-5.5 items-center justify-center rounded-xs border border-white bg-slate-400 text-white transition-colors disabled:border-transparent disabled:bg-slate-900 disabled:text-slate-400"
          disabled={requestInFlight || !chat.prompt.length}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </form>
  </div>
</Menu>
