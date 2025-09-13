<script lang="ts">
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';
  import { syntaxHighlighting } from '@codemirror/language';
  import { basicSetup, EditorView } from 'codemirror';
  import { onMount, type Snippet } from 'svelte';
  import { syntaxTheme, editorTheme } from '$lib/utils/codemirror';

  interface ReadonlyCodeEditorConfig {
    kind: 'readonly';
    doc: string;
    language: 'typescript' | 'javascript' | 'json';
  }

  interface EditableCodeEditorConfig {
    kind: 'editable';
    initialDoc: string;
    onchange: (value: string) => void;
    language: 'javascript' | 'json';
  }

  type CodeEditorConfig = ReadonlyCodeEditorConfig | EditableCodeEditorConfig;

  interface Props {
    config: CodeEditorConfig;
    view?: EditorView;
    class?: string;
    testId?: string;
    copyButton?: Snippet<[EditorView | undefined]>;
  }

  let {
    config,
    view = $bindable(undefined),
    class: className = '',
    testId = undefined,
    copyButton
  }: Props = $props();

  let editor: HTMLDivElement;

  onMount(() => {
    const extensions = [
      basicSetup,
      editorTheme,
      config.language === 'json'
        ? json()
        : javascript({ typescript: config.language === 'typescript' }),
      syntaxHighlighting(syntaxTheme)
    ];

    if (config.kind === 'editable') {
      const { onchange } = config;

      extensions.push(
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            onchange(v.state.doc.toString());
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

    function handleKeyDown(event: KeyboardEvent) {
      event.stopPropagation();
    }

    // Prevent keydown events from propagating.
    // This ensures these events won't trigger our global keybindings.
    view.dom.addEventListener('keydown', handleKeyDown);

    return () => {
      view?.destroy();
      view?.dom.removeEventListener('keydown', handleKeyDown);
    };
  });

  $effect(() => {
    if (view && config.kind === 'readonly') {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: config.doc }
      });
    }
  });
</script>

<div
  bind:this={editor}
  class={[
    'relative grow overflow-auto border border-slate-600 text-white',
    {
      'transition-colors focus-within:border-slate-400 hover:border-slate-400 focus:border-slate-400':
        config.kind === 'editable'
    },
    className
  ]}
  data-testid={testId}
>
  {@render copyButton?.(view)}
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  :global(.cm-editor) {
    @apply h-full;
  }

  :global(.cm-editor .cm-scroller) {
    @apply font-mono text-xs;
  }
</style>
