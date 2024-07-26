<script lang="ts">
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

  let className = '';
  export { className as class };
  export let disabled = false;
  export let loading = false;
  export let testId: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  function onClick() {
    dispatch('click');
  }
</script>

<button
  on:click={onClick}
  disabled={disabled || loading}
  class={cs(
    'rounded border border-slate-600 px-3 py-2 text-sm text-white transition focus:border-slate-400 enabled:hover:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-500',
    className
  )}
  data-testid={testId}
  >{#if loading}
    <span class="loader align-text-top" data-testid="loading-indicator" />
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
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
