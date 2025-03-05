<script lang="ts">
  import { slide } from 'svelte/transition';

  import ChatIcon from '$lib/components/icons/ChatIcon.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { ir } from '$lib/stores/ir';
  import { clickoutside } from '$lib/utils/actions';

  let chatVisible = $state(false);
  let prompt = $state('');
  let fetching = $state(false);
  let textarea: HTMLTextAreaElement | undefined = $state();
  let layerIds = $derived(Object.keys($ir.layers));

  function onClick() {
    chatVisible = true;
  }

  function onClickOutsideChat(event: CustomEvent<MouseEvent>) {
    if (
      chatVisible &&
      textarea &&
      !(event.detail.target as Node).contains(textarea)
    ) {
      chatVisible = false;
    }
  }

  function onKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }
  ) {
    if (event.key === 'Enter' && prompt.length > 0) {
      fetching = true;

      if (textarea) {
        textarea.blur();
      }

      fetch('/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          layerIds
        })
      })
        .then((response) => response.json())
        .then((data) => {
          dispatchLayerUpdate(data.diff);

          fetching = false;
          if (textarea) {
            textarea.value = '';
          }
        })
        .catch(() => {
          fetching = false;
        });
    }
  }
</script>

<button
  onclick={onClick}
  class={[
    'flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border border-transparent bg-slate-400 text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    chatVisible && 'border-white'
  ]}
  use:clickoutside
  onclickoutside={onClickOutsideChat}
  disabled={layerIds.length === 0}
>
  <ChatIcon />
</button>
{#if chatVisible}
  <Menu class="absolute bottom-16 left-1/2 -translate-x-1/2 p-4">
    <div class="flex flex-col gap-2">
      <div class="relative">
        <textarea
          class="w-fullborder h-32 w-64 resize-none rounded border border-slate-600 bg-slate-900 p-2 text-white"
          placeholder="Prompt the model to update map layers..."
          bind:value={prompt}
          bind:this={textarea}
          onkeydown={onKeyDown}
          disabled={fetching}
        >
        </textarea>
        <code class="absolute bottom-2 left-2 z-10 text-slate-400">gpt-4o</code>
      </div>
      {#if fetching}
        <p class="loading text-slate-400" transition:slide>Thinking</p>
      {/if}
    </div>
  </Menu>
{/if}

<style lang="postcss">
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
