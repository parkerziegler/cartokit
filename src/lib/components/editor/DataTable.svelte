<!-- Inspiration for this implementation courtesy of Observable:
     https://github.com/observablehq/inputs/blob/main/src/table.js -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Feature } from 'geojson';

  const ROW_HEIGHT = 33;

  export let data: Feature[];
  export let rows: number = 11.5;
  $: cols = Object.keys(data[0]?.properties ?? {});
  let root: HTMLDivElement;

  let array: Feature[] = [];
  let iterator: IterableIterator<Feature> = data[Symbol.iterator]();
  let N = data.length; // Total number of rows.
  let n = minlengthof(rows * 2); // The number of rows displayed.

  function minlengthof(length: number) {
    length = Math.floor(length);

    return Math.min(N, length);
  }

  function appendRows(start: number, end: number) {
    for (; start < end; start++) {
      const { done, value } = iterator.next();

      if (done) {
        break;
      }

      array.push(value);
    }
    array = array;
  }

  function onScroll() {
    if (
      root.scrollHeight - root.scrollTop < rows * ROW_HEIGHT * 1.5 &&
      n < minlengthof(n + 1)
    ) {
      appendRows(n, (n = minlengthof(n + rows)));
    }
  }

  onMount(() => {
    appendRows(0, n);
  });
</script>

<div
  class="w-full overflow-auto bg-slate-900 px-4 font-mono text-xs text-white"
  bind:this={root}
  on:scroll={onScroll}
  style="flex: 0 0 {(rows + 1) * ROW_HEIGHT - 1}px;"
>
  <table class="border-separate">
    <thead>
      <tr>
        {#each cols as col}
          <th
            class="sticky top-0 border-b border-slate-400 bg-slate-900 p-2 text-left font-semibold text-slate-400"
            >{col}</th
          >
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each array as row}
        <tr>
          {#each cols as col}
            <td
              class="cell truncate border-t border-dotted border-slate-400 p-2"
              >{row.properties?.[col] ?? ''}</td
            >
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  tr:first-child .cell {
    border-top: 0;
  }
</style>
