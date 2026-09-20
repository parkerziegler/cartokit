<script lang="ts">
  import { fly } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import Program from '$lib/components/editor/Program.svelte';
  import ViteIcon from '$lib/components/icons/ViteIcon.svelte';
  import TabItem from '$lib/components/shared/TabItem.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { ir } from '$lib/stores/ir';
  import { program } from '$lib/stores/program';
  import { downloadBlob } from '$lib/utils/files/download';

  const PROJECT_NAME = 'cartokit-project';

  async function onExportClick() {
    // Lazy-load the zip module so fflate stays out of the main bundle.
    const { zipProject } = await import('$lib/utils/files/zip');

    downloadBlob(
      zipProject($ir, $program, PROJECT_NAME),
      `${PROJECT_NAME}.zip`
    );
  }
</script>

<div
  class="absolute top-0 right-0 bottom-0 flex w-1/3 flex-col bg-slate-900 shadow-lg"
  in:fly={{ x: '100%', opacity: 1 }}
  out:fly={{ x: '100%', opacity: 1 }}
>
  <Tabs
    bodyClass="flex flex-1 overflow-hidden p-0!"
    containerClass="flex-1 overflow-auto"
    tablistClass="flex p-1 border-b border-slate-600 gap-1 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left"
  >
    {#each $program as file, i (i)}
      <TabItem
        title={file.path}
        defaultOpen={i === 0}
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
  <button
    class="absolute top-1 right-2.5 h-6 w-6 rounded bg-slate-600 p-1"
    onclick={onExportClick}
    aria-label="Export to Vite"
    {@attach tooltip({
      content: 'Export to Vite',
      placement: 'bottom'
    })}
  >
    <ViteIcon />
  </button>
  <CompilerOptions />
</div>
