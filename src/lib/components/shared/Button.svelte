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
    'stack-h stack-h-2xs items-center rounded border border-slate-600 px-3 py-1 font-sans text-sm text-white transition focus:border-slate-400 enabled:hover:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-500',
    className
  )}
  data-testid={testId}
  >{#if loading}
    <span class="loader align-text-top" data-testid="loading-indicator" />
  {:else if $$slots.icon}
    <slot name="icon" />
    <span><slot /></span>
  {:else}
    <slot />
  {/if}
</button>

<style>
  .loader {
    @apply relative inline-block h-5 w-5;
  }

  .loader::after,
  .loader::before {
    @apply absolute left-0 top-0 h-5 w-5 rounded-full bg-white;
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
