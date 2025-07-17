<script lang="ts">
  import { materializeColorScheme } from '$lib/utils/scheme';
  import type {
    CategoricalColorScheme,
    QuantitativeColorScheme,
    SchemeDirection
  } from '$lib/types';

  interface Props {
    scheme: CategoricalColorScheme | QuantitativeColorScheme;
    direction: SchemeDirection;
    count?: number;
  }

  let { scheme, direction, count }: Props = $props();

  let colors = $derived(materializeColorScheme(scheme, direction, count));
</script>

<div class="flex h-4 w-full">
  {#each colors as color (color)}
    <span style="background-color: {color};" class="flex-1"></span>
  {/each}
</div>
