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

  setContext('close-modal', () => {
    showModal = false;
  });

  const tabs = [
    { name: 'From API', content: FromAPI, props: {} },
    { name: 'From File', content: FromFile, props: {} },
    { name: 'From Gallery', content: FromGallery, props: {} }
  ];

  let showModal = $state(false);

  function onClick() {
    showModal = true;
  }

  onMount(() => {
    const unregisterKeybinding = registerKeybinding('l', onClick);

    return unregisterKeybinding;
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
  <Tabs {tabs} bodyClass="max-h-[24rem] overflow-y-auto"/>
</Modal>
