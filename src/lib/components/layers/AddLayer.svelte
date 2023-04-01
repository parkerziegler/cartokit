<script lang="ts">
  import { setContext } from 'svelte';

  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';
  import FromAPI from '$lib/components/layers/FromAPI.svelte';
  import FromFile from '$lib/components/layers/FromFile.svelte';

  setContext('close-modal', () => {
    showModal = false;
  });

  const tabs: Tab[] = [
    { name: 'From API', content: FromAPI },
    { name: 'From File', content: FromFile }
  ];

  let showModal = false;

  function onClick() {
    showModal = true;
  }
</script>

<button on:click={onClick}>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    ><line x1="12" y1="5" x2="12" y2="19" /><line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
    /></svg
  >
</button>
<Modal bind:showModal>
  <h2 slot="header" class="text-xl font-semibold">Add Layer</h2>
  <div slot="body">
    <Tabs {tabs} class="border-b border-b-slate-400 px-4" />
  </div>
</Modal>
