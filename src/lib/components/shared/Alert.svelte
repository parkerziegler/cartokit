<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    kind: 'error' | 'success' | 'warn' | 'info';
    message: string;
    class?: string;
    testId?: string;
    icon?: Snippet;
  }

  let {
    kind,
    message,
    class: className = '',
    testId = '',
    icon
  }: Props = $props();
</script>

<div
  class={[
    'flex items-center gap-2 rounded-sm p-2 text-sm',
    {
      'bg-green-500/10 text-green-200 outline outline-green-500/20':
        kind === 'success',
      'bg-red-500/15 text-red-100 outline outline-red-500/40': kind === 'error',
      'bg-yellow-500/10 text-yellow-100 outline outline-yellow-500/15':
        kind === 'warn',
      'bg-ck-light/10 text-ck-light outline-ck-light/20 outline':
        kind === 'info'
    },
    className
  ]}
  data-testid={testId}
>
  {#if icon}
    <span class="shrink-0">
      {@render icon()}
    </span>
  {/if}
  <p class="font-sans">{message}</p>
</div>
