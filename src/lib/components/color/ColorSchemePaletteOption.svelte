<script lang="ts">
  import { tick } from 'svelte';

  import ColorSchemePalette from '$lib/components/color/ColorSchemePalette.svelte';
  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme,
    SchemeDirection
  } from '$lib/types';

  interface Props {
    scheme: CategoricalColorScheme | QuantitativeColorScheme;
    direction: SchemeDirection;
    count?: number;
    active: boolean;
    onclickscheme: () => void;
  }

  let { scheme, direction, count, active, onclickscheme }: Props = $props();

  let ref: HTMLButtonElement;

  $effect(() => {
    if (active && ref) {
      tick().then(() => {
        ref.focus();
        ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  });
</script>

<button
  onclick={onclickscheme}
  class="ramp flex-1 p-2 hover:bg-slate-600"
  bind:this={ref}
>
  <ColorSchemePalette {scheme} {direction} {count} />
</button>

<style>
  .ramp:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }
</style>
