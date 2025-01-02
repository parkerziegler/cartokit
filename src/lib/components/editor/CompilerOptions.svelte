<script lang="ts">
  import { slide } from 'svelte/transition';

  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import { backend } from '$lib/stores/backend';

  let optionsExpanded = false;

  const languageBackends = [
    { value: 'javascript' as const, name: 'JavaScript' },
    { value: 'typescript' as const, name: 'TypeScript' }
  ];
  const libraryBackends = [
    { value: 'maplibre' as const, name: 'MapLibre GL JS' },
    { value: 'mapbox' as const, name: 'Mapbox GL JS' }
  ];
</script>

<div class="stack stack-xs border-r border-r-slate-600 px-4 py-2 text-white">
  <button on:click={() => (optionsExpanded = !optionsExpanded)}>
    <div class="flex items-center justify-between">
      <div class="stack-h stack-h-xs items-center">
        <p class="font-sans text-sm font-medium tracking-wider">Options</p>
        <GearIcon />
      </div>
      <ChevronIcon rotate={optionsExpanded ? 0 : 180} />
    </div>
  </button>
  {#if optionsExpanded}
    <div class="flex gap-4">
      <fieldset
        class="stack stack-xs text-white"
        transition:slide={{ axis: 'y', duration: 150 }}
      >
        <legend
          class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
          >Language</legend
        >
        {#each languageBackends as { value, name }}
          <label class="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="Language"
              {value}
              bind:group={$backend.language}
              style="color-scheme: dark;"
            />
            {name}</label
          >
        {/each}
      </fieldset>
      <fieldset
        class="stack stack-xs text-white"
        transition:slide={{ axis: 'y', duration: 150 }}
      >
        <legend
          class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
          >Library</legend
        >
        {#each libraryBackends as { value, name }}
          <label class="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="Library"
              {value}
              bind:group={$backend.library}
              style="color-scheme: dark;"
            />
            {name}</label
          >
        {/each}
      </fieldset>
    </div>
  {/if}
</div>
