<script lang="ts">
  import { EditorView } from 'codemirror';
  import { fade } from 'svelte/transition';

  import { tooltip } from '$lib/actions/tooltip.svelte';
  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { backend } from '$lib/stores/backend';
  import { program } from '$lib/stores/program';

  let copyButtonClicked = $state(false);

  function onCopyButtonClick(view?: EditorView) {
    navigator.clipboard.writeText(view?.state.doc.toString() ?? '');
    copyButtonClicked = true;

    setTimeout(() => {
      copyButtonClicked = false;
    }, 2000);
  }
</script>

<div class="flex w-full flex-col overflow-hidden">
  <CodeEditor
    config={{ kind: 'readonly', doc: $program, language: $backend.language }}
    testId="program-editor"
    class="overflow-hidden border-t-transparent"
  >
    {#snippet copyButton(view?: EditorView)}
      <button
        class="absolute top-2 right-2 z-10 h-6 w-6 rounded bg-slate-600 p-1 text-xs text-white opacity-100"
        onclick={() => onCopyButtonClick(view)}
        use:tooltip={() => ({ content: 'Copy', placement: 'top' })}
        in:fade|global={{ delay: 300, duration: 150 }}
        out:fade|global={{ duration: 150 }}
        aria-label="Copy"
      >
        {#if copyButtonClicked}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            in:fade={{ duration: 100, delay: 100 }}
            out:fade={{ duration: 100 }}
            class="absolute top-0 left-0 scale-75"
            ><path
              fill="currentColor"
              fill-rule="evenodd"
              d="m21.45 7-.662.663L9.797 18.654a2.187 2.187 0 0 1-3.094 0l-3.49-3.491-.664-.663 1.326-1.326.663.663 3.491 3.491c.122.122.32.122.442 0l10.991-10.99.663-.664L21.451 7Z"
              clip-rule="evenodd"
            /></svg
          >
        {:else}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            in:fade={{ duration: 100, delay: 100 }}
            out:fade={{ duration: 100 }}
            class="absolute top-0 left-0 scale-75"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.9375 3.875H13.0625C13.4077 3.875 13.6875 4.15482 13.6875 4.5C13.6875 4.84518 13.4077 5.125 13.0625 5.125H9.9375C9.59232 5.125 9.3125 4.84518 9.3125 4.5C9.3125 4.15482 9.59232 3.875 9.9375 3.875ZM7.51626 3.875C7.79379 2.79673 8.7726 2 9.9375 2H13.0625C14.2274 2 15.2063 2.79673 15.4838 3.875H18.0625H19V4.8125V17.9375C19 20.1811 17.1811 22 14.9375 22H8.0625C5.81884 22 4 20.1811 4 17.9375V4.8125V3.875H4.9375H7.51626ZM7.77195 5.75H7.75H5.875V17.9375C5.875 19.1456 6.85438 20.125 8.0625 20.125H14.9375C16.1456 20.125 17.125 19.1456 17.125 17.9375V5.75H15.25H15.228C14.7957 6.49725 13.9878 7 13.0625 7H9.9375C9.01215 7 8.20421 6.49725 7.77195 5.75Z"
              fill="currentColor"
            />
          </svg>
        {/if}
      </button>
    {/snippet}
  </CodeEditor>
  <CompilerOptions />
</div>
