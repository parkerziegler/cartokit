<script lang="ts">
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';
  import Program from '$lib/components/editor/Program.svelte';
  import Data from '$lib/components/editor/Data.svelte';

  let activeIndex: number;

  const tabs: Tab[] = [
    { name: 'Program', content: Program },
    { name: 'Data', content: Data }
  ];
</script>

<div class="relative z-10 col-span-4 flex flex-col bg-slate-900 shadow-lg">
  <Tabs
    {tabs}
    containerClass="flex-1 pt-2 absolute inset-0"
    bodyClass="flex flex-1 overflow-hidden !p-0"
    bind:activeIndex
  />
</div>
