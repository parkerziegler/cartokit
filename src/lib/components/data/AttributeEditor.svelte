<script lang="ts">
  import { onMount } from 'svelte';
  import { basicSetup, EditorView } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';

  export let onClose: () => void;

  let editor: HTMLDivElement;
  let view: EditorView;

  const doc = `function(data) {

  }`;

  onMount(() => {
    view = new EditorView({
      doc,
      extensions: [basicSetup, javascript()],
      parent: editor
    });
  });
</script>

<Menu class="max-w-md">
  <MenuItem title="Transform Data">
    <button on:click={onClose} slot="action"><CloseIcon /></button>
    <p>Use the editor below to add new attributes to your dataset.</p>
    <div bind:this={editor} class="overflow-auto" />
  </MenuItem>
</Menu>
