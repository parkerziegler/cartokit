<script lang="ts" generics="T">
  import cs from 'classnames';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';

  interface SelectOption<T> {
    value: T;
    label: string;
  }

  interface Props {
    selected: T;
    onChange: (
      event: Event & { currentTarget: EventTarget & HTMLSelectElement }
    ) => void;
    onClick?: (
      event: Event & { currentTarget: EventTarget & HTMLSelectElement }
    ) => void;
    id: string;
    options?: SelectOption<T>[];
    title?: string;
    class?: string;
  }

  let ref: HTMLSelectElement | HTMLDivElement;

  let {
    selected,
    onChange,
    onClick = () => {},
    id,
    options = [],
    title = '',
    class: className = ''
  }: Props = $props();

  export function getBoundingClientRect() {
    return ref.getBoundingClientRect();
  }
</script>

<div class="stack-h stack-h-xs items-baseline" bind:this={ref}>
  {#if title}
    <FieldLabel fieldId={id}>
      {title}
    </FieldLabel>
  {/if}
  <select
    class={cs(
      'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
      className
    )}
    value={selected}
    onchange={onChange}
    onclick={onClick}
    {id}
    bind:this={ref}
  >
    {#each options as option}
      <option value={option.value} selected={option.value === selected}
        >{option.label}</option
      >
    {/each}
  </select>
</div>
