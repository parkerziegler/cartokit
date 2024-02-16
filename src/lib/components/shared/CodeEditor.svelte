<script lang="ts">
  import { basicSetup, EditorView } from 'codemirror';
  import { syntaxHighlighting } from '@codemirror/language';
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';
  import { onMount, onDestroy } from 'svelte';

  import { syntaxTheme, editorTheme } from '$lib/utils/codemirror';

  interface ReadonlyCodeEditorConfig {
    kind: 'readonly';
    language: 'javascript' | 'json';
  }

  interface EditableCodeEditorConfig {
    kind: 'editable';
    onChange: (value: string) => void;
    onFocusChange?: (focusing: boolean) => void;
    language: 'javascript' | 'json';
  }

  type CodeEditorConfig = ReadonlyCodeEditorConfig | EditableCodeEditorConfig;

  export let doc: string;
  export let config: CodeEditorConfig;

  let editor: HTMLDivElement;
  let view: EditorView;

  onMount(() => {
    const extensions = [
      basicSetup,
      editorTheme,
      config.language === 'javascript' ? javascript() : json(),
      syntaxHighlighting(syntaxTheme)
    ];

    if (config.kind === 'editable') {
      const { onChange, onFocusChange } = config;

      extensions.push(
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            onChange(v.state.doc.toString());
          }
        })
      );

      extensions.push(
        EditorView.updateListener.of((v) => {
          if (v.focusChanged) {
            onFocusChange?.(view.hasFocus);
          }
        })
      );
    } else {
      extensions.push(EditorView.editable.of(false));
    }

    view = new EditorView({
      doc,
      extensions,
      parent: editor
    });
  });

  onDestroy(() => {
    view.destroy();
  });
</script>

<div
  bind:this={editor}
  class="grow overflow-auto border border-slate-600 transition-colors focus-within:border-slate-400 hover:border-slate-400 focus:border-slate-400"
/>
