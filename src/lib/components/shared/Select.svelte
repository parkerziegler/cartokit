<script lang="ts" generics="T">
  import cs from 'classnames';
  import type { ChangeEventHandler, MouseEventHandler } from 'svelte/elements';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';

  interface Props {
    selected: T;
    onchange: ChangeEventHandler<HTMLSelectElement>;
    onclick?: MouseEventHandler<HTMLSelectElement>;
    id: string;
    options: {
      value: T;
      label: string;
    }[];
    title?: string;
    class?: string;
  }

  let ref = $state<HTMLSelectElement | HTMLDivElement>();

  let {
    selected,
    onchange,
    onclick = () => {},
    id,
    options = [],
    title = '',
    class: className = ''
  }: Props = $props();

  export function getBoundingClientRect() {
    return ref!.getBoundingClientRect();
  }
</script>

{#if title}
  <div class="stack-h stack-h-xs items-baseline" bind:this={ref}>
    <FieldLabel fieldId={id}>
      {title}
    </FieldLabel>
    <select
      class={cs(
        'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
        className
      )}
      value={selected}
      {onchange}
      {onclick}
      {id}
    >
      {#each options as option (option.value)}
        <option value={option.value} selected={option.value === selected}
          >{option.label}</option
        >
      {/each}
    </select>
  </div>
{:else}
  <select
    class={cs(
      'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
      className
    )}
    value={selected}
    {id}
    {onchange}
    {onclick}
    bind:this={ref}
  >
    {#each options as option (option.value)}
      <option value={option.value} selected={option.value === selected}
        >{option.label}</option
      >
    {/each}
  </select>
{/if}
