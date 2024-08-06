<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme
  } from '$lib/types';

  export let colors: readonly string[];
  export let scheme: CategoricalColorScheme | QuantitativeColorScheme;
  export let active: boolean;

  let ref: HTMLButtonElement;
  const dispatch = createEventDispatcher();

  function onClick() {
    dispatch('click', { scheme });
  }

  $: if (active && ref) {
    ref.focus();
    ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

<li class="flex">
  <button
    on:click={onClick}
    class="scheme flex-1 p-2 hover:bg-slate-600"
    bind:this={ref}
  >
    <div class="flex h-4 w-full">
      {#each colors as color}
        <span style="background-color: {color};" class="flex-1" />
      {/each}
    </div>
  </button>
</li>

<style lang="postcss">
  .scheme:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
