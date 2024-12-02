<script lang="ts">
  import { slide } from 'svelte/transition';

  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import GearIcon from '$lib/components/icons/GearIcon.svelte';
  import MapboxIcon from '$lib/components/icons/MapboxIcon.svelte';
  import MapLibreIcon from '$lib/components/icons/MapLibreIcon.svelte';
  import { backend } from '$lib/stores/backend';

  let optionsExpanded = false;

  const options = [
    { value: 'maplibre' as const, icon: MapLibreIcon },
    { value: 'mapbox' as const, icon: MapboxIcon }
  ];
</script>

<form class="stack stack-xs border-r border-r-slate-600 px-4 py-2 text-white">
  <div class="flex items-center justify-between">
    <div class="stack-h stack-h-xs items-center">
      <p class="font-sans text-sm font-medium tracking-wider">Options</p>
      <GearIcon />
    </div>
    <button on:click={() => (optionsExpanded = !optionsExpanded)}>
      <ChevronIcon rotate={optionsExpanded ? 0 : 180} />
    </button>
  </div>
  {#if optionsExpanded}
    <fieldset
      class="stack stack-xs text-white"
      transition:slide={{ axis: 'y', duration: 150 }}
    >
      <legend
        class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
        >Library</legend
      >
      {#each options as { value, icon }}
        <label class="flex items-center text-xs">
          <input
            type="radio"
            name="Library"
            {value}
            bind:group={$backend}
            style="color-scheme: dark;"
          />
          <svelte:component this={icon} scale={0.75} /></label
        >
      {/each}
    </fieldset>
  {/if}
</form>
