<!-- Inspiration for this implementation courtesy of Observable:
     https://github.com/observablehq/inputs/blob/main/src/table.js -->
<script lang="ts">
  import type { Feature } from 'geojson';
  import { orderBy } from 'lodash-es';
  import { onMount } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import { slide } from 'svelte/transition';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import { layout } from '$lib/stores/layout';
  import { pluralize } from '$lib/utils/format';

  import { selectedFeature } from '$lib/stores/selected-feature';
  import { map } from '$lib/stores/map';
  import bbox from '@turf/bbox';

  interface Props {
    data: Feature[];
    tableName: string;
    onClose: () => void;
    class?: ClassValue;
  }

  let { data, tableName, onClose, class: className = '' }: Props = $props();
  let selectedRow: number | null = null;

  const ROW_HEIGHT = 33;
  const rows = 7;

  let cols = $derived(Object.keys(data[0]?.properties ?? {}));
  let root: HTMLDivElement;

  let array = $state<Feature[]>([]);
  let iterator = $state<IterableIterator<Feature>>(data[Symbol.iterator]());
  let n = $state<number>(Math.min(data.length, Math.floor(rows * 2))); // The number of rows displayed.
  let sort = $state<{ col: string; desc: boolean }>({ col: '', desc: true });

  function minlengthof(length: number) {
    length = Math.floor(length);

    return Math.min(data.length, length);
  }

  function materialize(data: Feature[]) {
    // Empty array and reinstantiate the iterator and n.
    array = [];
    iterator = data[Symbol.iterator]();
    n = minlengthof(rows * 2);

    // Add the first n rows.
    appendRows(0, n);

    // Reset selected row when reload.
    selectedRow = null;

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
  }

  function resort(col: string) {
    return function handleResort() {
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

  function handleRowClick(row: Feature, index: number) {
    selectedRow = index;

    selectedFeature.set(row);
    const bounds = bbox(row);

    const m = $map;
    if (!m) return;

    m.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      {
        padding: 50,
        duration: 800
      }
    );
  }

  onMount(() => {
    appendRows(0, n);
  });

</script>

<div
  class={[
    'ease-cubic-out z-10 flex flex-col overflow-hidden bg-slate-700 font-mono',
    { 'delay-150': !$layout.editorVisible },
    className
  ]}
  in:slide={{ axis: 'y' }}
  out:slide={{ axis: 'y' }}
>
  <div class="flex justify-between px-3 py-2 text-xs text-white">
    <span>
      {tableName}
    </span>
    <div class="flex gap-4">
      <span>{data.length} {pluralize('Feature', data.length)}</span>
      <button onclick={onClose}>
        <CloseIcon />
      </button>
    </div>
  </div>
  <div
    class="text-2xs w-full overflow-auto border-t border-slate-400 bg-slate-900 text-white"
    bind:this={root}
    onscroll={onScroll}
  >
    <table class="w-full border-collapse">
      <thead>
        <tr class="sticky top-0">
          {#each cols as col (col)}
            <th
              class={[
                'relative bg-slate-900 px-4 py-2 text-left font-semibold text-slate-400 hover:cursor-pointer',
                {
                  'sort-desc': sort.col === col && sort.desc,
                  'sort-asc': sort.col === col && !sort.desc
                }
              ]}
              onclick={resort(col)}
              >{col}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each array as row, i (i)}
          <tr
            class={[
              "border-t border-dotted border-slate-400 first:border-t-0 hover:bg-slate-600 cursor-pointer",
              selectedRow === i && "bg-slate-600"
            ]}
            onclick={() => handleRowClick(row, i)}
          >
            {#each cols as col (col)}
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
  @reference 'tailwindcss';

  .table-name::after {
    @apply absolute -bottom-px left-0 h-px w-full bg-slate-900;
    content: '';
  }

  th:first-child,
  td:first-child {
    @apply pl-4;
  }

  thead tr::after {
    @apply absolute -bottom-px left-0 w-full border-t border-slate-400;
    content: '';
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
