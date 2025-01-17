<script lang="ts">
  import cs from 'classnames';
  import type { Snippet } from 'svelte';

  interface Props {
    onClick?: (
      event: Event & { currentTarget: EventTarget & HTMLButtonElement }
    ) => void;
    class?: string;
    disabled?: boolean;
    loading?: boolean;
    testId?: string | undefined;
    children: Snippet;
  }

  let {
    onClick = () => {},
    class: className = '',
    disabled = false,
    loading = false,
    testId = undefined,
    children
  }: Props = $props();
</script>

<button
  onclick={onClick}
  disabled={disabled || loading}
  class={cs(
    'rounded border border-slate-600 px-3 py-2 text-sm text-white transition focus:border-slate-400 enabled:hover:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-500',
    className
  )}
  data-testid={testId}
  >{#if loading}
    <span class="loader align-text-top" data-testid="loading-indicator"></span>
  {:else}
    {@render children?.()}
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
