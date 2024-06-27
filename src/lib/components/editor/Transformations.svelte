<script lang="ts">
  import { Inspector } from '@observablehq/inspector';
  import { featureCollection } from '@turf/helpers';
  import type { EditorView } from 'codemirror';
  import * as Comlink from 'comlink';
  import type { FeatureCollection } from 'geojson';
  /* eslint-disable import/no-duplicates */
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';
  /* eslint-enable import/no-duplicates */

  import FunctionIcon from '$lib/components/icons/FunctionIcon.svelte';
  import LogsIcon from '$lib/components/icons/LogsIcon.svelte';
  import PlayIcon from '$lib/components/icons/PlayIcon.svelte';
  import PreviewIcon from '$lib/components/icons/PreviewIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import type { TransformationWorkerReturnValue } from '$lib/workers/transformation-worker';

  interface Log {
    type: 'log' | 'error';
    date: Date;
    value: unknown;
  }

  const doc = `export function transform(geoJSON) {
  return geoJSON;
}`;

  let view: EditorView;
  let selected = $selectedLayer?.id ?? Object.values($ir.layers)[0].id;
  let logs: Log[] = [];
  let consoleDisplay: HTMLUListElement;
  let transformationName = 'transform';

  $: options = Object.values($ir.layers).map((layer) => ({
    label: layer.displayName,
    value: layer.id
  }));

  function execute(data: FeatureCollection) {
    const program = view.state.doc.toString();
    const executeUserTransformation = Comlink.wrap<
      (
        program: string,
        data: FeatureCollection
      ) => Promise<TransformationWorkerReturnValue>
    >(
      new Worker(
        new URL('../../workers/transformation-worker.ts', import.meta.url),
        { type: 'module' }
      )
    );

    executeUserTransformation(program, data)
      .then(({ logs: ls, data: output, functionName }) => {
        transformationName = functionName;

        ls.forEach(async (entry) => {
          logs = [...logs, { date: new Date(), value: entry, type: 'log' }];
          await tick();
          const span = consoleDisplay.lastElementChild?.lastElementChild;

          if (span) {
            new Inspector(span).fulfilled(entry);
          }
        });
      })
      .catch((err) => {
        logs = [
          ...logs,
          {
            date: new Date(),
            value: err,
            type: 'error'
          }
        ];
      });
  }

  function onClick() {
    execute($ir.layers[selected].data.geoJSON);
  }

  function onClickPreview() {
    if ($selectedFeature) {
      execute(featureCollection([$selectedFeature]));
    }
  }
</script>

<div class="stack-border flex w-full flex-col">
  <MenuItem title="Layer">
    <div class="stack-h stack-h-xs items-center">
      <FieldLabel fieldId="transformation-layer"
        >Show Transformations For</FieldLabel
      >
      <Select {options} {selected} id="transformation-layer" />
    </div>
  </MenuItem>
  <MenuItem title="Code">
    <div class="group flex flex-col">
      <div class="flex flex-col">
        <div class="rounded-t bg-slate-600">
          <div class="flex items-center justify-between">
            <div
              class="stack-h stack-h-xs self-stretch overflow-hidden border-b border-white px-4 py-2 text-xs font-semibold"
            >
              <FunctionIcon />
              <p class="truncate">{transformationName}</p>
            </div>
            <div
              class="stack-h stack-h-2xs shrink-0 py-1 pr-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            >
              {#if $selectedFeature}
                <Button
                  on:click={onClickPreview}
                  class="!border-slate-400 bg-slate-900 !text-2xs"
                  ><PreviewIcon slot="icon" />Preview on Selected Feature</Button
                >
              {/if}
              <Button
                on:click={onClick}
                testId="run-transformation-button"
                class="!border-slate-400 bg-slate-900 !text-2xs"
                ><PlayIcon slot="icon" />Run</Button
              >
            </div>
          </div>
        </div>
        <CodeEditor
          config={{
            kind: 'editable',
            initialDoc: doc,
            language: 'javascript'
          }}
          class="min-h-48 overflow-auto border-t-0"
          bind:view
          testId="transformation-editor"
        />
      </div>
      <div class="rounded-b border-x border-b border-slate-600">
        <div class="bg-slate-600 pt-1">
          <div class="flex">
            <span
              class="stack-h stack-h-xs border-b border-white px-4 pb-1 text-xs font-semibold"
              ><LogsIcon />
              <p>Logs</p></span
            >
          </div>
        </div>
        {#if logs.length === 0}
          <div
            class="flex h-36 items-center justify-center p-4 text-slate-500"
            out:slide
          >
            Logs will appear here.
          </div>
        {:else}
          <ul
            class="overflow-auto text-2xs"
            bind:this={consoleDisplay}
            in:slide
          >
            {#each logs as entry}
              <li
                class="stack-h stack-h-xs items-baseline border-b border-slate-600 px-3 py-2 last:border-none"
              >
                <span class="shrink-0 text-3xs text-slate-500"
                  >{entry.date.toLocaleTimeString()}</span
                >
                {#if entry.type === 'error'}
                  <span class="text-red-500">{entry.value}</span>
                {:else}
                  <span></span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </MenuItem>
</div>
