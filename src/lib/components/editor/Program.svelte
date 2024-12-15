<script lang="ts">
  import CompilerOptions from '$lib/components/editor/CompilerOptions.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { backend } from '$lib/stores/backend';
  import { program } from '$lib/stores/program';
</script>

<div class="flex w-full flex-col overflow-hidden">
  <CodeEditor
    config={{ kind: 'readonly', doc: $program, language: $backend.language }}
    testId="program-editor"
    class="overflow-hidden border-t-transparent"
  />
  <CompilerOptions />
</div>
