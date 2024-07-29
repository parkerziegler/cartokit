<script context="module" lang="ts">
  export interface Tab<Props = Record<string, unknown>> {
    name: string;
    content: ComponentType;
    props?: Props;
  }
</script>

<script lang="ts">
  import cs from 'classnames';
  import type { ComponentType } from 'svelte';

  export let tabs: Tab[] = [];
  export let activeIndex = 0;

  export let containerClass = '';
  export let bodyClass = '';

  const setActiveTab = (i: number): (() => void) => {
    return (): void => {
      activeIndex = i;
    };
  };
</script>

<div class={cs('stack', containerClass)}>
  <ul class="stack-h stack-h-md border-b border-b-slate-400 px-4">
    {#each tabs as tab, i}
      <li
        class="border-b-2 pb-2 text-base transition-all duration-200"
        class:active={activeIndex === i}
        class:inactive={activeIndex !== i}
      >
        <button on:click={setActiveTab(i)}>{tab.name}</button>
      </li>
    {/each}
  </ul>
  <div class={cs('p-4', bodyClass)}>
    {#each tabs as tab, i}
      {#if activeIndex === i}
        <svelte:component this={tab.content} {...tab.props} />
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .active {
    @apply border-b-slate-400 font-semibold text-white;
  }

  .inactive {
    @apply border-b-transparent font-light text-slate-400;
  }
</style>
