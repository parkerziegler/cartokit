<script lang="ts">
  import { setContext } from 'svelte';

  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import FromAPI from '$lib/components/layers/FromAPI.svelte';
  import FromFile from '$lib/components/layers/FromFile.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { map } from '$lib/stores/map';

  setContext('close-modal', () => {
    showModal = false;
  });

  const tabs = [
    { name: 'From API', content: FromAPI, props: {} },
    { name: 'From File', content: FromFile, props: {} }
  ];

  let showModal = $state(false);

  function onClick() {
    showModal = true;
  }
</script>

<button
  onclick={onClick}
  class="disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
  data-testid="add-layer-button"
  aria-label="Add Layer"
  disabled={!$map}
>
  <PlusIcon />
</button>
<Modal
  bind:showModal
  class="max-w-lg"
  testId="add-layer-modal"
  initialHeight={327}
>
  {#snippet header()}
    <h2 class="text-xl font-semibold">Add Layer</h2>
  {/snippet}
  <Tabs {tabs} />
</Modal>
