<script lang="ts">
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import Chat from '$lib/components/chat/Chat.svelte';
  import ChatIcon from '$lib/components/icons/ChatIcon.svelte';

  let chatVisible = $state(false);
  let form: HTMLFormElement | undefined = $state();

  function onClick() {
    chatVisible = true;
  }

  function onClickOutsideChat(event: MouseEvent) {
    if (chatVisible && form && !form.contains(event.target as Node)) {
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
>
  <ChatIcon />
</button>
{#if chatVisible}
  <Chat bind:form />
{/if}
