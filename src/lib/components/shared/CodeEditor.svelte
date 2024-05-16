<script lang="ts">
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';
  import { syntaxHighlighting } from '@codemirror/language';
  import cs from 'classnames';
  import { basicSetup, EditorView } from 'codemirror';
  import { onMount } from 'svelte';

  import { syntaxTheme, editorTheme } from '$lib/utils/codemirror';

  interface ReadonlyCodeEditorConfig {
    kind: 'readonly';
    doc: string;
    language: 'javascript' | 'json';
  }

  interface EditableCodeEditorConfig {
    kind: 'editable';
    initialDoc: string;
    onChange: (value: string) => void;
    onFocusChange?: (focusing: boolean) => void;
    language: 'javascript' | 'json';
  }

  type CodeEditorConfig = ReadonlyCodeEditorConfig | EditableCodeEditorConfig;

  export let config: CodeEditorConfig;
  export let view: EditorView | null = null;
  let className = '';
  export { className as class };
  export let testId: string | undefined = undefined;

  let editor: HTMLDivElement;

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
            onFocusChange?.(view?.hasFocus ?? false);
          }
        })
      );
    } else {
      extensions.push(EditorView.editable.of(false));
    }

    view = new EditorView({
      doc: config.kind === 'editable' ? config.initialDoc : config.doc,
      extensions,
      parent: editor
    });

    return () => {
      view?.destroy();
    };
  });

  $: if (view && config.kind === 'readonly') {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: config.doc }
    });
  }
</script>

<div
  bind:this={editor}
  class={cs(
    'grow overflow-auto border border-slate-600 text-white',
    config.kind === 'editable' &&
      'transition-colors focus-within:border-slate-400 hover:border-slate-400 focus:border-slate-400',
    className
  )}
  data-testid={testId || undefined}
/>
