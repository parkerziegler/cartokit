<script
  lang="ts"
  generics="TabProps extends Record<string, any> = Record<string, any>"
>
  import cs from 'classnames';
  import type { Component } from 'svelte';

  interface Tab<TabProps extends Record<string, any> = Record<string, any>> {
    name: string;
    content: Component<TabProps>;
    props: TabProps;
  }

  interface Props {
    tabs: Tab<TabProps>[];
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

<div class={cs('stack', containerClass)}>
  <ul class="stack-h stack-h-md border-b border-b-slate-400 px-4">
    {#each tabs as tab, i}
      <li
        class="border-b-2 pb-2 text-base transition-all duration-200"
        class:active={activeIndex === i}
        class:inactive={activeIndex !== i}
      >
        <button onclick={onClick(i)}>{tab.name}</button>
      </li>
    {/each}
  </ul>
  <div class={cs('p-4', bodyClass)}>
    {#each tabs as tab, i}
      {#if activeIndex === i}
        <tab.content {...tab.props} />
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
