<!-- Inspiration for this implementation courtesy of Observable:
     https://github.com/observablehq/inputs/blob/main/src/table.js -->
<script lang="ts">
  import cs from 'classnames';
  import type { Feature } from 'geojson';
  import { orderBy } from 'lodash-es';
  /* eslint-disable import/no-duplicates */
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  /* eslint-enable import/no-duplicates */

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import { pluralize } from '$lib/utils/format';

  const ROW_HEIGHT = 33;
  const rows = 7;

  export let data: Feature[];
  export let tableName: string;
  export let onClose: () => void;

  let className = '';
  export { className as class };

  $: cols = Object.keys(data[0]?.properties ?? {});
  let root: HTMLDivElement;

  let array: Feature[] = [];
  let iterator: IterableIterator<Feature> = data[Symbol.iterator]();
  $: N = data.length; // Total number of rows.
  let n = Math.min(N, Math.floor(rows * 2)); // The number of rows displayed.
  let sort = { col: '', desc: true };

  function minlengthof(length: number) {
    length = Math.floor(length);

    return Math.min(N, length);
  }

  function materialize(data: Feature[]) {
    // Empty array and reinstantiate the iterator and n.
    array = [];
    iterator = data[Symbol.iterator]();
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
    return () => {
      sort = {
        col,
        desc: sort.col === col ? !sort.desc : true
      };

      const d = orderBy(data, `properties['${sort.col}']`, [
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

  $: if (root) {
    materialize(data);
  }
</script>

<div
  class={cs('flex flex-col overflow-hidden bg-slate-700 font-mono', className)}
  transition:slide
>
  <div class="flex justify-between px-3 py-2 text-xs text-white">
    <span>
      {tableName}
    </span>
    <div class="stack-h stack-h-sm">
      <span>{N} {pluralize('Feature', N)}</span>
      <button on:click={onClose}>
        <CloseIcon />
      </button>
    </div>
  </div>
  <div
    class="w-full overflow-auto border-t border-slate-400 bg-slate-900 text-2xs text-white"
    bind:this={root}
    on:scroll={onScroll}
  >
    <table class="w-full border-collapse">
      <thead>
        <tr class="sticky top-0">
          {#each cols as col}
            <th
              class="relative bg-slate-900 px-4 py-2 text-left font-semibold text-slate-400 hover:cursor-pointer"
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

<style lang="postcss">
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
