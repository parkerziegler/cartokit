<script lang="ts">
  import { EditorView } from 'codemirror';
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import ClipboardCheckIcon from '$lib/components/icons/ClipboardCheckIcon.svelte';
  import ClipboardIcon from '$lib/components/icons/ClipboardIcon.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';

  interface Props {
    doc: string;
    language: 'css' | 'html' | 'javascript' | 'json' | 'typescript';
  }

  let { doc, language }: Props = $props();
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

<div class="@container relative flex w-full flex-col overflow-hidden">
  <CodeEditor
    config={{
      kind: 'readonly',
      doc,
      language
    }}
    bind:view
    testId="program-editor"
    class="overflow-hidden border-t-transparent"
  />
  <button
    class="absolute top-2.5 z-10 h-6 w-6 translate-x-[calc(100cqw-100%-0.625rem)] rounded bg-slate-600 p-1 text-xs text-white"
    onclick={() => onCopyButtonClick(view)}
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
</div>
