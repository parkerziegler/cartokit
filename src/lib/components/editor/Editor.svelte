<script lang="ts">
  import { slide } from 'svelte/transition';

  import Program from '$lib/components/editor/Program.svelte';
  import Transformations from '$lib/components/editor/Transformations.svelte';
  import Tabs from '$lib/components/shared/Tabs.svelte';
  import { editor } from '$lib/stores/editor';
  import { ir } from '$lib/stores/ir';

  $: tabs =
    Object.values($ir.layers).length > 0
      ? [
          {
            name: 'Program',
            content: Program
          },
          {
            name: 'Transformations',
            content: Transformations
          }
        ]
      : [
          {
            name: 'Program',
            content: Program
          }
        ];
</script>

<div
  class="absolute right-0 top-0 flex h-full w-1/3 flex-col bg-slate-900 shadow-lg"
  transition:slide={{ axis: 'x' }}
>
  <Tabs
    {tabs}
    containerClass="flex-1 pt-2 absolute inset-0"
    bodyClass="flex flex-1 overflow-hidden !p-0"
    bind:activeIndex={$editor}
  />
</div>
