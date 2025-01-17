<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    colors: readonly string[];
    active: boolean;
    onclickscheme: MouseEventHandler<HTMLButtonElement>;
  }

  let { colors, active, onclickscheme }: Props = $props();

  let ref: HTMLButtonElement;

  $effect(() => {
    if (active && ref) {
      ref.focus();
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
</script>

<li class="flex">
  <button
    onclick={onclickscheme}
    class="scheme flex-1 p-2 hover:bg-slate-600"
    bind:this={ref}
  >
    <div class="flex h-4 w-full">
      {#each colors as color}
        <span style="background-color: {color};" class="flex-1"></span>
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
