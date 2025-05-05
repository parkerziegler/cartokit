<script lang="ts">
  import { slide } from 'svelte/transition';

  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';

  interface Props {
    kind: 'error' | 'success' | 'warn';
    message: string;
    class?: string;
  }

  let { kind, message, class: className = '' }: Props = $props();
</script>

<div
  class={[
    'flex items-center gap-2 rounded border bg-opacity-50 px-2 py-1 text-white',
    {
      'border-green-400 bg-green-400': kind === 'success',
      'border-red-400 bg-red-400': kind === 'error',
      'border-yellow-400 bg-yellow-400': kind === 'warn'
    },
    className
  ]}
  transition:slide
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
