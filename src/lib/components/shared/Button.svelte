<script lang="ts">
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

  let className = '';
  export { className as class };
  export let disabled = false;
  export let loading = false;

  const dispatch = createEventDispatcher();
  const onClick = () => {
    dispatch('click');
  };
</script>

<button
  on:click={onClick}
  {disabled}
  class={cs(
    'rounded bg-slate-700 px-3 py-2 text-sm text-white transition-opacity enabled:hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:cursor-not-allowed',
    className
  )}
  >{#if loading}
    <span class="loader align-text-top" />
  {:else}<slot />{/if}</button
>

<style>
  .loader {
    @apply relative inline-block h-4 w-4;
  }

  .loader::after,
  .loader::before {
    @apply absolute left-0 top-0 h-4 w-4 rounded-full bg-white;
    content: '';
    animation: animloader 0.5s ease-in-out infinite;
  }

  @keyframes animloader {
    0% {
      transform: scale(0);
      opacity: 1;
    }

    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
