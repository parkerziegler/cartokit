<script lang="ts">
  import * as turf from '@turf/turf';
  import { EditorView } from 'codemirror';
  import type { FeatureCollection } from 'geojson';
  import { onDestroy } from 'svelte';

  import Alert from '$lib/components/shared/Alert.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import PlayCircle from '$lib/components/icons/PlayCircle.svelte';
  import TerminalIcon from '$lib/components/icons/TerminalIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import { parseStringToTransformation } from '$lib/utils/parse';
  import { transformationWorker } from '$lib/utils/worker';

  interface Props {
    oncloseeditor: () => void;
    onclickoutsideeditor: (event: MouseEvent) => void;
    layerId: string;
    geojson: FeatureCollection;
  }

  let { oncloseeditor, onclickoutsideeditor, layerId, geojson }: Props =
    $props();

  // Main editor state.
  let view: EditorView | undefined = $state();
  let error = $state('');
  let success = $state(false);
  let timeoutId: number | undefined;
  const doc = `function transformGeojson(geojson) {
  return geojson;
}`;

  // Preview editor state.
  let previewError = $state('');
  let previewDoc: string = $state(
    $selectedFeature
      ? JSON.stringify(
          {
            type: $selectedFeature.type,
            properties: $selectedFeature.properties,
            geometry: $selectedFeature.geometry
          },
          null,
          2
        )
      : ''
  );

  // Console state.
  let consoleOutput: string[] = $state([]);

  export function focus() {
    view?.focus();
  }

  function onClick() {
    const program = view?.state.doc.toString() ?? '';

    transformationWorker(program, geojson, (message) => {
      switch (message.type) {
        case 'data': {
          dispatchLayerUpdate({
            type: 'transformation',
            layerId,
            payload: {
              geojson: message.data,
              transformation: {
                ...parseStringToTransformation(program, 'tabular'),
                args: []
              }
            }
          });

          success = true;
          // Clear any errors on successful transformation.
          error = '';

          // Set a timeout to hide the success message.
          timeoutId = window.setTimeout(() => {
            success = false;
          }, 3000);
          break;
        }
        case 'console':
          break;
        case 'error':
          success = false;
          error = message.error.message;
          break;
      }
    });
  }

  function onEditorChange(program: string) {
    if ($selectedFeature) {
      transformationWorker(
        program,
        turf.featureCollection([$selectedFeature]),
        (message) => {
          // TODO: Split out the additional edge cases here.
          // - message.data?.[0] is strictly a GeoJSON feature.
          // - message.data?.[0] is _not_ a GeoJSON feature (warning).
          // - message.data is null (warning).
          switch (message.type) {
            case 'data':
              previewError = '';

              if (message.data.features?.[0]) {
                previewDoc = JSON.stringify(
                  {
                    type: message.data.features[0].type,
                    properties: message.data.features[0].properties,
                    geometry: message.data.features[0].geometry
                  },
                  null,
                  2
                );
              } else {
                previewDoc = JSON.stringify(
                  message.data.features?.[0],
                  null,
                  2
                );
              }
              break;
            case 'console':
              previewError = '';

              message.args.forEach((entry) => {
                consoleOutput.push(JSON.stringify(entry, null, 2));
              });
              consoleOutput = consoleOutput;
              break;
            case 'error':
              previewDoc = '';
              previewError = message.error.message;
              break;
          }
        }
      );
    }
  }

  onDestroy(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });
</script>

<Menu class="relative z-10 w-96" onclickoutsidemenu={onclickoutsideeditor}>
  <MenuItem title="Transform Data">
    {#snippet action()}
      <button onclick={oncloseeditor}><CloseIcon /></button>
    {/snippet}
    <div class="flex flex-col gap-4">
      <p class="font-sans">
        Use the editor below to transform your dataset using JavaScript.
      </p>
      <CodeEditor
        config={{
          kind: 'editable',
          initialDoc: doc,
          language: 'javascript',
          onchange: onEditorChange
        }}
        class="-mx-4 max-h-38 overflow-auto"
        bind:view
        testId="transformation-editor"
      />
      {#if error}
        <Alert
          kind="error"
          message={`Failed to transform data. Error: ${error}`}
        />
      {:else if success}
        <Alert kind="success" message="Successfully transformed data." />
      {/if}
      <Button
        class="flex items-center gap-2 self-end"
        onclick={onClick}
        testId="run-transformation-button"
        ><span>Run</span><PlayCircle /></Button
      >
    </div>
  </MenuItem>
  <MenuItem title="Preview (1 selected feature)" titleClass="items-baseline">
    <CodeEditor
      config={{ kind: 'readonly', doc: previewDoc, language: 'json' }}
      class="-mx-4 max-h-38 overflow-auto"
    />
    {#snippet action()}
      <p class="text-slate-400">OUTPUT</p>
    {/snippet}
    {#if previewError}
      <Alert kind="error" message={previewError} />
    {/if}
  </MenuItem>
  <MenuItem title="Console">
    <ul class="-mx-4 max-h-38 overflow-auto">
      {#each consoleOutput as entry, i (`${entry}-${i}`)}
        <li
          class="border-b border-slate-600 px-4 py-2 text-white first:border-t"
        >
          {entry}
        </li>
      {/each}
      <li class="px-4 py-2 text-white">
        <TerminalIcon />
      </li>
    </ul>
  </MenuItem>
</Menu>
