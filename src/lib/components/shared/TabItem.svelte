<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  import {
    TabContext,
    type SelectedTab
  } from '$lib/components/shared/Tabs.svelte';

  interface Props {
    class?: (open: boolean) => ClassValue;
    open: boolean;
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
    open = $bindable(false),
    title,
    children
  }: Props = $props();
  const tabId = $props.id();

  const ctx = getContext<{
    panelId: string;
    selectedTab?: SelectedTab;
  }>(TabContext);

  $effect(() => {
    if (ctx.selectedTab?.id !== undefined) {
      open = ctx.selectedTab.id === tabId;
    }
  });

  $effect(() => {
    if (open) {
      ctx.selectedTab = { id: tabId, snippet: children };
    } else if (ctx.selectedTab?.id === tabId) {
      ctx.selectedTab = undefined;
    }
  });
</script>

<li role="presentation" class="flex">
  <button
    class={className(open)}
    type="button"
    onclick={() => (open = true)}
    role="tab"
    id={tabId}
    aria-controls={ctx.panelId}
    aria-selected={open}
  >
    {title}
  </button>
</li>
