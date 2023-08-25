<script context="module" lang="ts">
  export interface Tab<Props = Record<string, unknown>> {
    name: string;
    content: ComponentType;
    props?: Props;
  }
</script>

<script lang="ts">
  import type { ComponentType } from 'svelte';
  import cs from 'classnames';

  export let tabs: Tab[] = [];

  let activeIndex = 0;

  let className = '';
  export { className as class };

  function setActiveTab(i: number) {
    return function onTabClick() {
      activeIndex = i;
    };
  }
</script>

<div class="stack">
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
  <div class={cs('p-4', className)}>
    {#each tabs as tab, i}
      {#if activeIndex === i}
        <svelte:component this={tab.content} {...tab.props} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .active {
    @apply border-b-slate-400 font-semibold text-white;
  }

  .inactive {
    @apply border-b-transparent font-light text-slate-400;
  }
</style>
