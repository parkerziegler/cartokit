<script lang="ts" generics="T">
  import type { ChangeEventHandler } from 'svelte/elements';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';

  interface Props {
    selected: T;
    onchange: ChangeEventHandler<HTMLSelectElement>;
    id: string;
    options: {
      value: T;
      label: string;
    }[];
    title?: string;
    class?: string;
    loading?: boolean;
  }

  let ref = $state<HTMLSelectElement | HTMLDivElement>();

  let {
    selected,
    onchange,
    id,
    options = [],
    title = '',
    class: className = '',
    loading = false
  }: Props = $props();

  export function getBoundingClientRect() {
    return ref!.getBoundingClientRect();
  }
</script>

<div class="stack-h stack-h-xs items-baseline" bind:this={ref}>
  {#if title}
    <FieldLabel fieldId={id}>
      {title}
    </FieldLabel>
  {/if}
  <select
    class={[
      'relative border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
      className
    ]}
    value={selected}
    {onchange}
    {id}
  >
    {#each options as option (option.value)}
      <option value={option.value} selected={option.value === selected}
        >{option.label}</option
      >
    {/each}
  </select>
  {#if loading}
    <span class="loader align-text-top" data-testid="loading-indicator"></span>
  {/if}
</div>

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
