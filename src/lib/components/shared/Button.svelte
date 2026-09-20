<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';

  interface Props {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    class?: string;
    disabled?: boolean;
    loading?: boolean;
    success?: boolean;
    testId?: string | undefined;
    children: Snippet;
  }

  let {
    onclick = () => {},
    class: className = '',
    disabled = false,
    loading = false,
    success = false,
    testId = undefined,
    children
  }: Props = $props();

  const SUCCESS_DURATION_MS = 2000;

  let succeeded = $state(false);
  const indicatorTransition = $derived({
    x: prefersReducedMotion.current ? 0 : 8,
    duration: prefersReducedMotion.current ? 0 : 150
  });

  $effect(() => {
    if (!success) {
      return;
    }

    succeeded = true;
    const timeoutId = window.setTimeout(() => {
      succeeded = false;
    }, SUCCESS_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  });
</script>

<button
  {onclick}
  disabled={disabled || loading}
  class={[
    'flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition focus:border-slate-400 disabled:cursor-not-allowed',
    succeeded
      ? 'bg-ck-light text-slate-900'
      : 'border-slate-600 text-white enabled:hover:border-slate-400 disabled:text-slate-500',
    className
  ]}
  data-testid={testId}
>
  {@render children?.()}
  {#if loading || succeeded}
    <span class="relative size-4 shrink-0">
      {#if succeeded}
        <span
          class="absolute inset-0 flex [&_svg]:size-4"
          data-testid="success-indicator"
          transition:fly={indicatorTransition}
        >
          <CheckIcon />
        </span>
      {:else if loading}
        <!-- The spinner lives on an inner element so that its rotation
        animation and the transition's translation don't fight over
        `transform`. -->
        <span
          class="absolute inset-0 flex"
          data-testid="loading-indicator"
          transition:fly={indicatorTransition}
        >
          <span class="loader"></span>
        </span>
      {/if}
    </span>
  {/if}
</button>

<style lang="postcss">
  @reference 'tailwindcss';

  .loader {
    @apply inline-block h-4 w-4 rounded-full;
    border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
    border-top-color: currentColor;
    animation: animloader 0.6s linear infinite;
  }

  @keyframes animloader {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loader {
      animation-duration: 2s;
    }
  }
</style>
