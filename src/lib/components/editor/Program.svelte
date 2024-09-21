<script lang="ts">
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';

  export let program: string;
</script>

<CodeEditor
  config={{ kind: 'readonly', doc: program, language: 'javascript' }}
  testId="program-editor"
/>
