<!-- Inspiration for this implementation courtesy of Observable:
     https://github.com/observablehq/inputs/blob/main/src/table.js -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Feature } from 'geojson';
  import orderBy from 'lodash.orderby';

  const ROW_HEIGHT = 33;
  const TAB_HEIGHT = 33;

  export let data: Feature[];
  export let tableName: string;
  export let rows: number = 11.5;

  $: cols = Object.keys(data[0]?.properties ?? {});
  let root: HTMLDivElement;

  let array: Feature[] = [];
  let iterator: IterableIterator<Feature> = data[Symbol.iterator]();
  let N = data.length; // Total number of rows.
  let n = minlengthof(rows * 2); // The number of rows displayed.
  let sort = { col: '', desc: true };

  function minlengthof(length: number) {
    length = Math.floor(length);

    return Math.min(N, length);
  }

  function materialize(d: Feature[]) {
    // Empty array and reinstantiate the iterator and n.
    array = [];
    iterator = d[Symbol.iterator]();
    n = minlengthof(rows * 2);

    // Add the first n rows.
    appendRows(0, n);

    // Scroll to the top.
    root.scrollTo(root.scrollLeft, 0);
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

  function resort(col: string) {
    return function handleSort() {
      sort = {
        col,
        desc: sort.col === col ? !sort.desc : true
      };

      const d = orderBy(data, `properties.['${sort.col}']`, [
        sort.desc ? 'desc' : 'asc'
      ]);

      materialize(d);
    };
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
  class="flex flex-col overflow-hidden bg-slate-700 font-mono"
  style="flex: 0 0 {(rows + 1) * ROW_HEIGHT - 1 + TAB_HEIGHT}px;"
>
  <span
    class="table-name relative self-start border-r border-r-slate-400 bg-slate-900 px-3 py-2 text-xs text-white"
  >
    {tableName}
  </span>
  <div
    class="w-full overflow-auto border-t border-slate-400 text-2xs text-white"
    bind:this={root}
    on:scroll={onScroll}
  >
    <table class="border-collapse bg-slate-900">
      <thead>
        <tr class="sticky top-0">
          {#each cols as col}
            <th
              class="relative bg-slate-900 px-4 py-2 text-left font-semibold text-slate-400"
              class:sort-desc={sort.col === col && sort.desc}
              class:sort-asc={sort.col === col && !sort.desc}
              on:click={resort(col)}
              >{col}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each array as row}
          <tr class="border-t border-dotted border-slate-400 first:border-t-0">
            {#each cols as col}
              <td class="cell truncate px-4 py-2"
                >{row.properties?.[col] ?? ''}</td
              >
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-name::after {
    @apply absolute left-0 w-full bg-slate-900;
    content: '';
    height: 1px;
    bottom: -1px;
  }

  th:first-child,
  td:first-child {
    padding-left: 1rem;
  }

  thead tr::after {
    @apply absolute left-0 w-full border-t border-slate-400;
    content: '';
    bottom: -1px;
  }

  .sort-desc::after,
  .sort-asc::after {
    @apply absolute right-0;
  }

  .sort-desc::after {
    content: '▾';
  }

  .sort-asc::after {
    content: '▴';
  }
</style>
