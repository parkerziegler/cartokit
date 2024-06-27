<script lang="ts">
  import CodeBlockIcon from '$lib/components/icons/CodeBlockIcon.svelte';
  import { editor } from '$lib/stores/editor';
  import { layout } from '$lib/stores/layout';

  function onClick() {
    editor.set(1);
    layout.update((layout) => {
      layout.editorVisible = true;

      return layout;
    });
  }
</script>

<button on:click={onClick}>
  <CodeBlockIcon />
</button>
