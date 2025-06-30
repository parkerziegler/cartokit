<script
  lang="ts"
  generics="TabProps extends Record<string, unknown> = Record<string, unknown>"
>
  import type { Component } from 'svelte';

  interface Props {
    tabs: {
      name: string;
      content: Component<TabProps>;
      props: TabProps;
    }[];
    containerClass?: string;
    bodyClass?: string;
  }

  let { tabs, containerClass = '', bodyClass = '' }: Props = $props();
  let activeIndex = $state(0);

  function onClick(i: number): () => void {
    return function setActiveTab(): void {
      activeIndex = i;
    };
  }
</script>

<div class={['flex flex-col', containerClass]}>
  <ul class="flex gap-6 border-b border-b-slate-400 px-4">
    {#each tabs as tab, i (tab.name)}
      <li
        class="border-b-2 pb-2 text-base transition-all duration-200"
        class:active={activeIndex === i}
        class:inactive={activeIndex !== i}
      >
        <button onclick={onClick(i)}>{tab.name}</button>
      </li>
    {/each}
  </ul>
  <div class={['p-4', bodyClass]}>
    {#each tabs as tab, i (tab.name)}
      {#if activeIndex === i}
        <tab.content {...tab.props} />
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  @reference 'tailwindcss';

  .active {
    @apply border-b-slate-400 font-semibold text-white;
  }

  .inactive {
    @apply border-b-transparent font-light text-slate-400;
  }
</style>
