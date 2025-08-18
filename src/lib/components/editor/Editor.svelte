<script lang="ts">
  import { slide } from 'svelte/transition';

  import Program from '$lib/components/editor/Program.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';

  const tabs = [
    {
      name: 'Program',
      content: Program,
      props: {}
    }
  ];
</script>

<div
  class="absolute top-0 right-0 flex h-full w-1/3 flex-col bg-slate-900 shadow-lg"
  in:slide={{ axis: 'x' }}
  out:slide={{ axis: 'x', delay: 150 }}
>
  <Tabs
    {tabs}
    containerClass="flex-1 pt-2 absolute inset-0"
    bodyClass="flex flex-1 overflow-hidden p-0!"
  />
</div>
