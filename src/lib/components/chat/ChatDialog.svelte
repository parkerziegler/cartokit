<script lang="ts">
  import { startCase } from 'lodash-es';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import { chat, type Prompt } from '$lib/state/chat.svelte';
  import { pluralize } from '$lib/utils/formatters/shared';

  interface Props {
    ref?: HTMLDivElement;
  }

  let { ref = $bindable(undefined) }: Props = $props();

  function deriveEditMessage(prompt: Prompt) {
    const { success, error } = Object.groupBy(prompt.diffs, (diff) => {
      switch (diff.type) {
        case 'error':
          return 'error';
        case 'unknown':
          return 'unknown';
        default:
          return diff.errored ? 'error' : 'success';
      }
    });

    return `${success?.length ?? 0} ${pluralize('edit', success?.length ?? 0)} applied${error && error.length > 0 ? `, ${error.length} ${pluralize('edit', error.length)} errored` : ''}`;
  }

  onMount(() => {
    ref?.scrollTo({
      top: ref.scrollHeight
    });
  });
</script>

<div
  class="flex flex-col gap-2 overflow-auto rounded-t-sm border-x border-t border-slate-600 p-2"
  transition:slide
  bind:this={ref}
>
  {#each chat.dialog as prompt (prompt.id)}
    <div class="max-w-[65%] self-end rounded-sm bg-slate-700 px-2 py-1">
      <p class="text-white">{prompt.text}</p>
    </div>
    <div class="max-w-3/4 px-2 py-1">
      {#if prompt.summary === 'Thinking'}
        <p class="loading text-slate-400">Thinking</p>
      {:else}
        <p class="text-white">{prompt.summary}</p>
        <div class="flex items-baseline gap-1">
          {#if prompt.diffs.length > 0}
            <div class="flex gap-0.5">
              {#each prompt.diffs as diff, i (i)}
                <span
                  class={[
                    'bg-oxide-green/60 border-oxide-green h-2 w-2 rounded-full border',
                    {
                      'bg-oxide-yellow/60 border-oxide-yellow border':
                        diff.type === 'unknown'
                    },
                    {
                      'bg-oxide-red/60 border-oxide-red border':
                        diff.type === 'error' || diff.errored
                    }
                  ]}
                  {@attach tooltip({
                    content: startCase(diff.type)
                  })}
                ></span>
              {/each}
            </div>
          {/if}
          <p class="text-slate-600">
            {deriveEditMessage(prompt)}
          </p>
        </div>
      {/if}
    </div>
  {/each}
</div>

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
