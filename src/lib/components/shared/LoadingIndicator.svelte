<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  interface Props {
    class?: ClassValue;
    variant?: 'sm' | 'base' | 'lg';
  }

  let { class: className, variant = 'base' }: Props = $props();

  const indicatorTransition = $derived({
    x: prefersReducedMotion.current ? 0 : 8,
    duration: prefersReducedMotion.current ? 0 : 150
  });
</script>

<span
  class={className}
  data-testid="loading-indicator"
  transition:fly={indicatorTransition}
>
  <span
    class={[
      'loader inline-block rounded-full align-middle',
      {
        'size-3 border-[1.5px]': variant === 'sm',
        'size-4 border-2': variant === 'base',
        'size-8 border-4': variant === 'lg'
      }
    ]}
  ></span>
</span>

<style lang="postcss">
  @reference 'tailwindcss';

  .loader {
    border-color: color-mix(in srgb, currentColor 25%, transparent);
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
