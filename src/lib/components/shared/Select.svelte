<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';

  type T = $$Generic;

  interface SelectOption<T> {
    value: T;
    label: string;
  }

  export let selected: T;
  export let options: SelectOption<T>[] = [];
  export let title: string = '';

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('change', { value: target.value });
  }
</script>

{#if title}
  <div class="stack-h stack-h-xs items-baseline">
    <FieldLabel fieldId={title}>
      {title}
    </FieldLabel>
    <select
      class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600 {$$props.class}"
      value={selected}
      on:change={onChange}
      id={title}
    >
      {#each options as option}
        <option value={option.value} selected={option.value === selected}
          >{option.label}</option
        >
      {/each}
    </select>
  </div>
{:else}
  <select
    class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600 {$$props.class}"
    value={selected}
    on:change={onChange}
  >
    {#each options as option}
      <option value={option.value} selected={option.value === selected}
        >{option.label}</option
      >
    {/each}
  </select>
{/if}
