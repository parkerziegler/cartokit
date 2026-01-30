<script lang="ts">
  import { EditorView } from 'codemirror';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import { tooltip } from '$lib/attachments/tooltip';
  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import ClipboardCheckIcon from '$lib/components/icons/ClipboardCheckIcon.svelte';
  import ClipboardIcon from '$lib/components/icons/ClipboardIcon.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { backend } from '$lib/stores/backend';
  import { program } from '$lib/stores/program';
  import { registerKeybinding } from '$lib/utils/keybinding';

  let copyButtonClicked = $state(false);
  let view = $state<EditorView | undefined>(undefined);

  function onCopyButtonClick(view?: EditorView) {
    navigator.clipboard.writeText(view?.state.doc.toString() ?? '');
    copyButtonClicked = true;

    setTimeout(() => {
      copyButtonClicked = false;
    }, 2000);
  }

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('p', onCopyButtonClick);

    return deregisterKeybinding;
  });
</script>

<div class="flex w-full flex-col overflow-hidden">
  <CodeEditor
    config={{
      kind: 'readonly',
      doc: $program,
      language: $backend.language
    }}
    bind:view
    testId="program-editor"
    class="overflow-hidden border-t-transparent"
  />
  <button
    class="absolute top-13 right-2.5 z-10 h-6 w-6 rounded bg-slate-600 p-1 text-xs text-white opacity-100"
    onclick={() => onCopyButtonClick(view)}
    in:fade|global={{ delay: 300, duration: 150 }}
    out:fade|global={{ duration: 150 }}
    aria-label="Copy Program"
    {@attach tooltip({
      content: 'Copy Program',
      keybinding: 'P',
      placement: 'top'
    })}
  >
    {#if copyButtonClicked}
      <ClipboardCheckIcon />
    {:else}
      <ClipboardIcon />
    {/if}
  </button>
  <CompilerOptions />
</div>
