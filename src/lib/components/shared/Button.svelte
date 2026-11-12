<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import LoadingIndicator from '$lib/components/shared/LoadingIndicator.svelte';

  interface Props {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    class?: string;
    variant?: 'tiny' | 'big';
    disabled?: boolean;
    loading?: boolean;
    success?: boolean;
    testId?: string | undefined;
    children: Snippet;
  }

  let {
    onclick = () => {},
    class: className = '',
    variant = 'big',
    disabled = false,
    loading = false,
    success = false,
    testId = undefined,
    children,
    ...props
  }: Props = $props();

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
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  });
</script>

<button
  {onclick}
  disabled={disabled || loading}
  class={[
    'flex items-center gap-2 rounded-sm border transition focus:border-slate-400 disabled:cursor-not-allowed',
    variant === 'tiny' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
    succeeded
      ? 'bg-ck-light text-slate-900'
      : 'border-slate-600 text-white enabled:hover:border-slate-400 disabled:text-slate-500',
    className
  ]}
  data-testid={testId}
  {...props}
>
  {@render children?.()}
  {#if loading || succeeded}
    <span class="relative size-4 shrink-0">
      {#if succeeded}
        <span
          class="absolute inset-0 flex"
          data-testid="transformation-success-indicator"
          transition:fly={indicatorTransition}
        >
          <CheckIcon />
        </span>
      {:else if loading}
        <LoadingIndicator class="absolute inset-0" />
      {/if}
    </span>
  {/if}
</button>
