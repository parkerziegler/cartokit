<script lang="ts" generics="T">
  // ESLint sees the generic T as an undefined variable; flag it as a "global"
  // to suppress the warning.
  /* global T */
  import cs from 'classnames';
  import { createEventDispatcher } from 'svelte';

  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';

  interface SelectOption<T> {
    value: T;
    label: string;
  }

  export let selected: T;
  export let options: SelectOption<T>[] = [];
  export let id;
  export let title = '';
  let ref: HTMLSelectElement | HTMLDivElement;

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  function onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('change', { value: target.value });
  }

  function onClick(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('click', { value: target.value });
  }

  export const getBoundingClientRect = () => ref.getBoundingClientRect();
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
      on:change={onChange}
      on:click={onClick}
      {id}
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
    class={cs(
      'border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600',
      className
    )}
    value={selected}
    {id}
    on:change={onChange}
    on:click={onClick}
    bind:this={ref}
  >
    {#each options as option}
      <option value={option.value} selected={option.value === selected}
        >{option.label}</option
      >
    {/each}
  </select>
{/if}
