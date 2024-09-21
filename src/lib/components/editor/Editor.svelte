<script lang="ts">
  import { slide } from 'svelte/transition';

  import Program from '$lib/components/editor/Program.svelte';
  import Tabs, { type Tab } from '$lib/components/shared/Tabs.svelte';

  export let program: string;

  let activeIndex: number;

  $: tabs = [
    {
      name: 'Program',
      content: Program,
      props: { program }
    }
  ] as Tab<{ program: string }>[];
</script>

<div
  class="absolute right-0 top-0 flex h-full w-1/3 flex-col bg-slate-900 shadow-lg"
  transition:slide={{ axis: 'x' }}
>
  <Tabs
    {tabs}
    containerClass="flex-1 pt-2 absolute inset-0"
    bodyClass="flex flex-1 overflow-hidden !p-0"
    bind:activeIndex
  />
</div>
