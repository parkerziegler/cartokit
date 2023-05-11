<script lang="ts">
  import { setContext } from 'svelte';

  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import FromAPI from '$lib/components/layers/FromAPI.svelte';
  import FromFile from '$lib/components/layers/FromFile.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';

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
  <PlusIcon />
</button>
<Modal bind:showModal>
  <h2 slot="header" class="text-xl font-semibold">Add Layer</h2>
  <div slot="body">
    <Tabs {tabs} class="border-b border-b-slate-400 px-4" />
  </div>
</Modal>
