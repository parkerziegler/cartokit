<script lang="ts">
  import { onMount } from 'svelte';
  import type { Feature } from 'geojson';

  import { ROW_HEIGHT, minlengthof } from '$lib/utils/data-table';

  export let data: Feature[];
  export let rows: number = 11.5;
  $: cols = Object.keys(data[0].properties ?? {});
  let root: HTMLDivElement;

  let array: Feature[] = [];
  let index: number[] = [];
  let iterator: IterableIterator<Feature> | undefined = data[Symbol.iterator]();
  let iterindex: number | undefined = 0;
  let N = data.length; // Total number of rows.
  let n = minlengthof({
    length: rows * 2,
    N,
    iterindex,
    iterator,
    array,
    index
  }); // Number of rows that fit in the viewport.

  function materialize() {
    if (typeof iterindex !== 'undefined' && iterindex >= 0) {
      iterindex = iterator = undefined;
      index = new Array(data.length).fill(undefined).map((_, i) => i);
      N = index.length;
    }
  }

  function appendRows(start: number, end: number) {
    if (iterindex === start) {
      for (; start < end; start++) {
        if (iterator) {
          array.push(iterator.next().value);
          array = array;
        }
      }
    } else {
      for (let k; start < end; start++) {
        k = index[start];
        array.push(data[k]);
        array = array;
      }
    }
  }

  function onScroll() {
    if (
      root.scrollHeight - root.scrollTop < rows * ROW_HEIGHT * 1.5 &&
      n < minlengthof({ length: n + 1, N, iterindex, iterator, array, index })
    ) {
      appendRows(
        n,
        (n = minlengthof({
          length: n + rows,
          N,
          iterindex,
          iterator,
          array,
          index
        }))
      );
    }
  }

  onMount(() => {
    materialize();

    if (minlengthof({ length: 1, N, iterindex, iterator, array, index })) {
      appendRows(0, n);
    }
  });
</script>

<div
  class="w-full overflow-auto bg-slate-900 p-2 font-mono text-xs text-white"
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
