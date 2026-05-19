<script lang="ts">
  import { bbox } from '@turf/turf';
  import * as d3 from 'd3';
  import type { Feature } from 'geojson';
  import { orderBy, isEqual } from 'lodash-es';
  import type { ClassValue } from 'svelte/elements';
  import { slide } from 'svelte/transition';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import { map } from '$lib/state/map.svelte';
  import { layout } from '$lib/stores/layout';
  import type { CartoKitSource } from '$lib/types';
  import { pluralize } from '$lib/utils/formatters/shared';

  interface Props {
    rows: Feature[];
    columns: string[];
    tableName: string;
    onClose: () => void;
    sourceType: CartoKitSource['type'];
    class?: ClassValue;
  }

  let {
    rows,
    columns,
    tableName,
    onClose,
    sourceType,
    class: className = ''
  }: Props = $props();

  const ROW_HEIGHT = 33;
  const ROW_COUNT = 7;

  let root: HTMLDivElement;

  let sort = $state<{ col: string; desc: boolean }>({ col: '', desc: true });
  let selectedRow = $state<Feature | null>(null);

  const data = $derived(
    orderBy<Feature>(rows, `properties['${sort.col}']`, [
      sort.desc ? 'desc' : 'asc'
    ])
  );
  let n = $state<number>(ROW_COUNT * 2);
  const materializedRows = $derived<Feature[]>(
    data.slice(0, minlengthof(data, n))
  );

  $effect(() => {
    // Scroll to top when new data is loaded.
    if (data && root) {
      root.scrollTop = 0;
    }
  });

  function minlengthof(d: Feature[], length: number) {
    return Math.min(d.length, length);
  }

  function resort(col: string) {
    return function handleResort() {
      sort = {
        col,
        desc: sort.col === col ? !sort.desc : true
      };
    };
  }

  function onScroll() {
    if (
      root.scrollHeight - root.scrollTop < ROW_COUNT * ROW_HEIGHT * 1.5 &&
      n < minlengthof(data, n + 1)
    ) {
      n = minlengthof(data, n + ROW_COUNT);
    }
  }

  function handleRowClick(materializedRow: Feature) {
    selectedRow = materializedRow;
    const bounds = bbox(materializedRow);

    map.value!.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      {
        padding: {
          top: 200,
          left: 200,
          bottom: 400,
          right: 200
        },
        duration: 1000
      }
    );
  }
</script>

<div
  class={[
    'ease-cubic-out z-10 flex flex-col overflow-hidden bg-slate-900 font-mono',
    { 'delay-150': !$layout.editorVisible },
    className
  ]}
  in:slide={{ axis: 'y' }}
  out:slide={{ axis: 'y' }}
>
  <div class="flex justify-between bg-slate-700 px-3 py-2 text-xs text-white">
    <span>
      {tableName}
    </span>
    <div class="flex gap-4">
      <span
        >{d3.format(',')(data.length)}
        {pluralize('Feature', data.length)}{sourceType === 'vector'
          ? ' in Viewport'
          : ''}</span
      >
      <button onclick={onClose}>
        <CloseIcon />
      </button>
    </div>
  </div>
  <div
    class="text-2xs w-full overflow-auto border-t border-slate-400 text-white"
    bind:this={root}
    onscroll={onScroll}
  >
    <table class="w-full border-collapse">
      <thead>
        <tr class="sticky top-0">
          {#each columns as col (col)}
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
        {#each materializedRows as materializedRow, i (i)}
          <tr
            class={[
              'cursor-pointer border-b border-dotted border-slate-400',
              isEqual(selectedRow?.properties, materializedRow.properties)
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'hover:bg-slate-800'
            ]}
            onclick={() => handleRowClick(materializedRow)}
          >
            {#each columns as col (col)}
              <td class="cell truncate px-4 py-2"
                >{materializedRow.properties?.[col] ?? ''}</td
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
