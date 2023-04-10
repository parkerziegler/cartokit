<script lang="ts">
  import type { CartoKitProportionalSymbolLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitProportionalSymbolLayer;
  $: min = layer.style.size.min;
  $: max = layer.style.size.max;
</script>

<div class="stack">
  <svg
    viewBox="0 0 {max * 2 + 8} {max * 2 + 8}"
    height={max * 2 + 8}
    width={max * 2 + 8}
  >
    <circle
      r={min}
      cx={max + 4}
      cy={max * 2 - min + 4}
      stroke="#fff"
      fill="none"
    />
    <circle r={max} cx={max + 4} cy={max + 4} stroke="#fff" fill="none" />
  </svg>
</div>
