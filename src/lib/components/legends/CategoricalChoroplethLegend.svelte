<script lang="ts">
  import type { CategoricalFill, ConstantStroke } from '$lib/types';
  import { DEFAULT_FILL } from '$lib/utils/constants';

  export let fill: CategoricalFill;
  export let stroke: ConstantStroke | undefined;

  $: entries =
    fill.scheme.length < fill.categories.length
      ? fill.categories.slice(0, fill.scheme.length).concat('Other')
      : fill.categories;
</script>

<div class="stack stack-xs ml-8 text-white">
  <p>{fill.attribute}</p>
  <ul>
    {#each entries as category, i}
      <li class="stack-h stack-h-xs">
        <svg viewBox="0 0 32 16" width="32" height="16">
          <rect
            x="0"
            y="0"
            width="32"
            height="16"
            fill={fill.scheme[i] ?? DEFAULT_FILL}
            fill-opacity={fill.opacity}
            stroke={stroke?.color ?? 'none'}
            stroke-width={stroke?.width ?? '0'}
            stroke-opacity={stroke?.opacity ?? '0'}
          />
        </svg>
        <span>{category}</span>
      </li>
    {/each}
  </ul>
</div>
