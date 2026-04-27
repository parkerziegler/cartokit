<script lang="ts">
  import { onMount } from 'svelte';

  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import { tooltip } from '$lib/attachments/tooltip';
  import Chat from '$lib/components/chat/Chat.svelte';
  import ChatIcon from '$lib/components/icons/ChatIcon.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';

  let chatVisible = $state(false);
  let requestInFlight = $state(false);
  let form: HTMLFormElement | undefined = $state();

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('c', onClick);

    return deregisterKeybinding;
  });

  function onClick() {
    chatVisible = true;
  }

  function onClickOutsideChat(event: MouseEvent) {
    if (
      chatVisible &&
      !requestInFlight &&
      !form?.contains(event.target as Node)
    ) {
      chatVisible = false;
    }
  }
</script>

<button
  onclick={onClick}
  class={[
    'flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border border-transparent bg-slate-400 text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    {
      'border-white': chatVisible
    }
  ]}
  {@attach onClickOutside({ callback: onClickOutsideChat })}
  {@attach tooltip({ content: 'Chat', keybinding: 'C' })}
>
  <ChatIcon />
</button>
{#if chatVisible}
  <Chat bind:form bind:requestInFlight />
{/if}
