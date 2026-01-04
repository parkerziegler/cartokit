<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  import ArrowUpIcon from '$lib/components/icons/ArrowUpIcon.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { user } from '$lib/state/user.svelte';
  import { ir } from '$lib/stores/ir';

  interface Props {
    form?: HTMLFormElement;
  }

  let { form = $bindable(undefined) }: Props = $props();

  let prompt = $state('');
  let fetching = $state(false);
  let diffUnknown = $state(false);
  let error = $state(false);
  let textarea: HTMLTextAreaElement | undefined = $state();

  let layerIds = $derived(Object.keys($ir.layers));
  let layerIdsToAttributes = $derived(
    Object.entries($ir.layers).reduce<Record<string, string[]>>(
      (acc, [layerId, layer]) => {
        acc[layerId] = Object.keys(
          layer.data.geojson.features[0].properties ?? {}
        );

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
    if (event.key === 'Enter' && !event.shiftKey && prompt.length > 0) {
      onSubmit(event);
    }
  }

  async function onSubmit(
    event: Event & {
      currentTarget: EventTarget & (HTMLFormElement | HTMLTextAreaElement);
    }
  ) {
    event.preventDefault();

    fetching = true;

    if (textarea) {
      textarea.blur();
    }

    try {
      const data = await fetch('/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          layerIds,
          layerIdsToAttributes,
          userId: user.userId
        })
      }).then((response) => response.json());

      for (const diff of data.diffs) {
        if (diff.type === 'unknown') {
          diffUnknown = true;

          setTimeout(() => {
            diffUnknown = false;
          }, 3000);
        } else {
          await applyDiff(diff);
        }
      }

      prompt = '';
    } catch {
      error = true;

      setTimeout(() => {
        error = false;
      }, 3000);
    } finally {
      fetching = false;
    }
  }
</script>

<Menu class="absolute bottom-16 left-1/2 -translate-x-1/2 p-4">
  <div class="flex flex-col gap-2 rounded-sm border border-slate-600">
    <form class="flex flex-col gap-2" onsubmit={onSubmit} bind:this={form}>
      <textarea
        class="h-32 w-72 resize-none rounded-sm rounded-b-none bg-slate-900 p-2 text-white"
        placeholder="Prompt the model to update map layers..."
        bind:value={prompt}
        bind:this={textarea}
        disabled={fetching}
        onkeydown={onKeyDown}
      >
      </textarea>
      <div class="flex items-center justify-between px-2 pb-2">
        <code
          class="self-start rounded-xs bg-slate-400 px-1 py-0.5 text-xs text-white"
          >GPT-5</code
        >
        <button
          class="flex h-[22px] w-[22px] items-center justify-center rounded-xs border border-white bg-slate-400 text-white disabled:opacity-50"
          disabled={fetching || error || diffUnknown || !prompt.length}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </form>
    {#if fetching}
      <p class="loading px-2 text-slate-400" transition:slide>Thinking</p>
    {/if}
    {#if error}
      <Alert
        kind="error"
        message="There was an error processing the request. Ensure you've added layers to the map."
        class="mx-2 mb-2"
      />
    {/if}
    {#if diffUnknown}
      <Alert
        kind="warn"
        message="⚠️ The model was unable to understand the request. Please rephrase your prompt."
        class="mx-2 mb-2"
      />
    {/if}
  </div>
</Menu>

<style lang="postcss">
  @reference 'tailwindcss';

  .loading::after {
    @apply inline-block w-0 overflow-hidden align-middle;

    content: '\2026';
    animation: ellipsis steps(4, end) 400ms infinite;
  }

  @keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }
</style>
