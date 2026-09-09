<script lang="ts" module>
  export interface SelectedTab {
    id: string;
    snippet: Snippet;
  }

  export const TabContext = Symbol('tabs');
</script>

<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    bodyClass?: string;
    containerClass?: string;
    tablistClass?: string;
    children: Snippet;
  }

  let {
    children,
    containerClass = '',
    bodyClass = '',
    tablistClass = 'flex gap-6 border-b border-b-slate-400 px-4'
  }: Props = $props();
  const panelId = $props.id();

  const ctx = $state<{
    panelId: string;
    selectedTab?: SelectedTab;
  }>({
    panelId,
    selectedTab: undefined
  });

  setContext(TabContext, ctx);
</script>

<div class={['flex flex-col', containerClass]}>
  <ul role="tablist" class={tablistClass}>
    {@render children()}
  </ul>
  <div
    id={ctx.panelId}
    role="tabpanel"
    aria-labelledby={ctx.selectedTab?.id}
    class={['p-4', bodyClass]}
  >
    {@render ctx.selectedTab?.snippet?.()}
  </div>
</div>
