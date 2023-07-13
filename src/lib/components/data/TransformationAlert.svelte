<script lang="ts">
  import { slide } from 'svelte/transition';

  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';

  type Alert =
    | { kind: 'error'; message: string }
    | { kind: 'success' }
    | { kind: 'warning'; message: string };

  export let alert: Alert;
</script>

<div class="stack stack-xs" transition:slide>
  {#if alert.kind === 'error'}
    <div
      class="stack stack-xs rounded border border-red-400 bg-red-400 bg-opacity-50 px-2 py-1"
    >
      <div class="stack-h stack-h-xs items-center">
        <AlertIcon />
        <p class="font-sans">Failed to transform data. Original error:</p>
      </div>
      <p>
        {alert.message}
      </p>
    </div>
    <p class="font-sans">Try fixing the error and reexecuting the code.</p>
  {:else if alert.kind === 'success'}
    <div
      class="stack-h stack-h-xs items-center rounded border border-green-400 bg-green-400 bg-opacity-50 px-2 py-1"
    >
      <CheckIcon />
      <p>Successfully transformed data.</p>
    </div>
  {/if}
</div>
