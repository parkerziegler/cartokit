<script lang="ts">
  import Chat from '$lib/components/chat/Chat.svelte';
  import ChatIcon from '$lib/components/icons/ChatIcon.svelte';
  import { clickoutside } from '$lib/utils/actions';

  let chatVisible = $state(false);
  let form: HTMLFormElement | undefined = $state();

  function onClick() {
    chatVisible = true;
  }

  function onClickOutsideChat(event: CustomEvent<MouseEvent>) {
    if (chatVisible && form && !form.contains(event.detail.target as Node)) {
      chatVisible = false;
    }
  }
</script>

<button
  onclick={onClick}
  class={[
    'flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border border-transparent bg-slate-400 text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    chatVisible && 'border-white'
  ]}
  use:clickoutside
  onclickoutside={onClickOutsideChat}
>
  <ChatIcon />
</button>
{#if chatVisible}
  <Chat bind:form />
{/if}
