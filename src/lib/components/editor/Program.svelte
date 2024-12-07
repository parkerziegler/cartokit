<script lang="ts">
  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { program } from '$lib/stores/program';
</script>

<div class="flex w-full flex-col overflow-hidden">
  <CodeEditor
    config={{ kind: 'readonly', doc: $program, language: 'javascript' }}
    testId="program-editor"
    class="overflow-hidden border-t-transparent"
  />
  <CompilerOptions />
</div>
