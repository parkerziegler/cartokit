<script lang="ts">
  import { basicSetup, EditorView } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { onMount } from 'svelte';

  import { program } from '$lib/stores/program';

  let editor: HTMLDivElement;
  let view: EditorView;

  onMount(() => {
    view = new EditorView({
      doc: $program,
      // For now, we'll keep the editor read-only. We can't actually evaluate user code
      // currently since we have no way to map arbitrary programs to the CartoKit IR.
      extensions: [basicSetup, javascript(), EditorView.editable.of(false)],
      parent: editor
    });
  });

  $: if (view) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: $program }
    });
  }
</script>

<div bind:this={editor} class="grow overflow-auto" />
