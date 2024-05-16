<script lang="ts">
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import { program } from '$lib/stores/program';
</script>

<CodeEditor
  config={{ kind: 'readonly', doc: $program, language: 'javascript' }}
  testId="program-editor"
/>
