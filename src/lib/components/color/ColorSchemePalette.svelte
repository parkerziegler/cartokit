<script lang="ts">
  interface Props {
    colors: readonly string[];
    active: boolean;
    onClick: (
      event: Event & { currentTarget: EventTarget & HTMLButtonElement }
    ) => void;
  }

  let { colors, active, onClick }: Props = $props();

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
    onclick={onClick}
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
