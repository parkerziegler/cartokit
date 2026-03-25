<script lang="ts">
  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';

  interface Props {
    kind: 'error' | 'success' | 'warn' | 'info';
    message: string;
    class?: string;
    testId?: string;
  }

  let { kind, message, class: className = '', testId = '' }: Props = $props();
</script>

<div
  class={[
    'flex items-center gap-2 rounded-sm p-2 text-sm',
    {
      'bg-green-500/10 text-green-200 outline outline-green-500/20':
        kind === 'success',
      'bg-red-500/10 text-red-100 outline outline-red-500/15': kind === 'error',
      'bg-yellow-500/10 text-yellow-100 outline outline-yellow-500/15':
        kind === 'warn',
      'bg-blue-500/10 text-blue-300 outline outline-blue-500/20':
        kind === 'info'
    },
    className
  ]}
  data-testid={testId}
>
  <span class="shrink-0">
    {#if kind === 'success'}
      <CheckIcon />
    {:else if kind === 'error'}
      <AlertIcon />
    {/if}
  </span>
  <p class="font-sans">{message}</p>
</div>
