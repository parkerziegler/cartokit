<script lang="ts">
  import { fly } from 'svelte/transition';

  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import Program from '$lib/components/editor/Program.svelte';
  import TabItem from '$lib/components/shared/TabItem.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { program } from '$lib/stores/program';
</script>

<div
  class="absolute top-0 right-0 bottom-0 flex w-1/3 flex-col bg-slate-900 shadow-lg"
  in:fly={{ x: '100%', opacity: 1 }}
  out:fly={{ x: '100%', opacity: 1, delay: 150 }}
>
  <Tabs
    bodyClass="flex flex-1 overflow-hidden p-0!"
    containerClass="flex-1"
    tablistClass="flex p-1 border-b border-slate-600 gap-1"
  >
    {#each $program as file, i (file.name)}
      <TabItem
        title={file.name}
        open={i === 0}
        class={(open) => [
          'rounded-xs px-2 py-1 text-xs transition-all',
          open
            ? 'bg-slate-700 font-semibold text-white'
            : 'bg-slate-800 font-light text-slate-400'
        ]}
      >
        <Program doc={file.text} language={file.language} />
      </TabItem>
    {/each}
  </Tabs>
  <CompilerOptions />
</div>
