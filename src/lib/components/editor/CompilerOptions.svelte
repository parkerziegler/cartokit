<script lang="ts">
  import { slide } from 'svelte/transition';

  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import { backend } from '$lib/state/backend.svelte';

  let optionsExpanded = $state(false);

  const languageBackends = [
    { value: 'javascript' as const, name: 'JavaScript' },
    { value: 'typescript' as const, name: 'TypeScript' }
  ];
  const libraryBackends = [
    { value: 'maplibre' as const, name: 'MapLibre GL JS' },
    { value: 'mapbox' as const, name: 'Mapbox GL JS' }
  ];
</script>

<div
  class="flex flex-col gap-2 border-r border-r-slate-600 px-4 py-2 text-white"
>
  <button onclick={() => (optionsExpanded = !optionsExpanded)}>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <p class="font-sans text-sm font-medium tracking-wider">Options</p>
        <GearIcon />
      </div>
      <ChevronIcon rotate={optionsExpanded ? 0 : 180} />
    </div>
  </button>
  {#if optionsExpanded}
    <div class="flex gap-4" transition:slide={{ axis: 'y', duration: 150 }}>
      <fieldset class="flex flex-col gap-2 text-white">
        <legend
          class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
          >Language</legend
        >
        {#each languageBackends as { value, name } (value)}
          <label class="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="Language"
              {value}
              bind:group={backend.value.language}
              style="color-scheme: dark;"
            />
            {name}</label
          >
        {/each}
      </fieldset>
      <fieldset class="flex flex-col gap-2 text-white">
        <legend
          class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
          >Library</legend
        >
        {#each libraryBackends as { value, name } (value)}
          <label class="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="Library"
              {value}
              bind:group={backend.value.library}
              style="color-scheme: dark;"
            />
            {name}</label
          >
        {/each}
      </fieldset>
    </div>
  {/if}
</div>
