<script lang="ts">
  import { onMount, setContext } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import FromAPI from '$lib/components/layers/FromAPI.svelte';
  import FromFile from '$lib/components/layers/FromFile.svelte';
  import FromGallery from '$lib/components/layers/FromGallery.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { map } from '$lib/state/map.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';
  import TabItem from '../shared/TabItem.svelte';

  setContext('close-modal', () => {
    showModal = false;
  });

  let showModal = $state(false);

  function onClick() {
    showModal = true;
  }

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('l', onClick);

    return deregisterKeybinding;
  });
</script>

<button
  onclick={onClick}
  class="cursor-pointer disabled:cursor-not-allowed"
  data-testid="add-layer-button"
  aria-label="Add Layer"
  disabled={!map.value}
  {@attach tooltip({
    content: 'Add Layer',
    keybinding: 'L',
    placement: 'right',
    offsetValue: 20
  })}
>
  <PlusIcon />
</button>
<Modal
  bind:showModal
  class="max-w-lg"
  testId="add-layer-modal"
  initialHeight={329}
>
  {#snippet header()}
    <h2 class="text-xl font-semibold">Add Layer</h2>
  {/snippet}
  <Tabs bodyClass="max-h-[24rem] overflow-y-auto">
    <TabItem title="From API" open>
      <FromAPI />
    </TabItem>
    <TabItem title="From File" open={false}>
      <FromFile />
    </TabItem>
    <TabItem title="From Gallery" open={false}>
      <FromGallery />
    </TabItem>
  </Tabs>
</Modal>
