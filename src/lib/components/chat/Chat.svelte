<script lang="ts">
  import { uniqueId } from 'lodash-es';
  import { onMount, tick } from 'svelte';

  import ChatDialog from '$lib/components/chat/ChatDialog.svelte';
  import ArrowUpIcon from '$lib/components/icons/ArrowUpIcon.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { chat, MODELS } from '$lib/state/chat.svelte';
  import { ir } from '$lib/stores/ir';
  import type { LLM, LLMRequest, LLMRequestState } from '$lib/types/llm';
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

  let requestState: LLMRequestState = $derived({
    center: $ir.center,
    zoom: $ir.zoom,
    projection: $ir.projection,
    basemap: $ir.basemap,
    layers: Object.values($ir.layers)
      .sort((a, b) => a.layout.z - b.layout.z)
      .map(({ id, displayName, type, layout, source }) => ({
        id,
        displayName,
        type,
        layout,
        attributes: selectAttributes(source),
        sourceLayerIds:
          source.type === 'vector'
            ? source.vectorLayers.map(({ id }) => id)
            : []
      }))
  });

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
    chat.model = event.currentTarget.value as LLM;
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
      // Capture the conversation before the in-flight turn joins it.
      // Turns that failed before the model responded are dropped — their
      // summary and "error" diff are synthesized by the catch block below.
      // Remove them so we don't teach the model edits it did not generate.
      const history = chat.dialog.filter(
        (prompt) => !prompt.diffs.some((diff) => diff.type === 'error')
      );

      chat.dialog.push({
        id: uniqueId('prompt__'),
        text: chat.prompt,
        diffs: [],
        summary: 'Thinking'
      });

      await scrollToBottom();

      const body = JSON.stringify({
        model: chat.model,
        prompt: chat.prompt,
        requestState,
        history
      } satisfies LLMRequest);

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
