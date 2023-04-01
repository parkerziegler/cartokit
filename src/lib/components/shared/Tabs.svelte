<script context="module" lang="ts">
  export interface Tab {
    name: string;
    content: typeof SvelteComponent;
  }
</script>

<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let tabs: Tab[] = [];

  let activeIndex = 0;

  function setActiveTab(i: number) {
    return function onTabClick() {
      activeIndex = i;
    };
  }
</script>

<div class="stack">
  <ul class="stack-h stack-h-md {$$props.class}">
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
  <div class="p-4">
    {#each tabs as tab, i}
      {#if activeIndex === i}
        <svelte:component this={tab.content} />
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
