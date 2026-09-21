<script lang="ts">
  import { getContext, onDestroy, onMount, type Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  import {
    TabContext,
    type SelectedTab
  } from '$lib/components/shared/Tabs.svelte';

  interface Props {
    class?: (open: boolean) => ClassValue;
    defaultOpen?: boolean;
    title: string;
    children: Snippet;
  }

  let {
    class: className = (open) => [
      'border-b-2 pb-2 text-base transition-all duration-200',
      open
        ? 'border-b-slate-400 font-semibold text-white'
        : 'border-b-transparent font-light text-slate-400'
    ],
    defaultOpen = false,
    title,
    children
  }: Props = $props();
  const tabId = $props.id();

  const ctx = getContext<{
    panelId: string;
    selectedTab?: SelectedTab;
  }>(TabContext);

  const open = $derived(ctx.selectedTab?.id === tabId);

  function select() {
    ctx.selectedTab = { id: tabId, snippet: children };
  }

  onMount(() => {
    if (defaultOpen && !ctx.selectedTab) {
      select();
    }
  });

  onDestroy(() => {
    if (open) {
      ctx.selectedTab = undefined;
    }
  });
</script>

<li role="presentation" class="flex">
  <button
    class={['text-nowrap', className(open)]}
    type="button"
    onclick={select}
    role="tab"
    id={tabId}
    aria-controls={ctx.panelId}
    aria-selected={open}
  >
    {title}
  </button>
</li>
