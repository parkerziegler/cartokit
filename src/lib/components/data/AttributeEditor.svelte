<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { basicSetup, EditorView } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';
  import { featureCollection as turfFeatureCollection } from '@turf/helpers';

  import TransformationAlert from '$lib/components/data/TransformationAlert.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import PlayCircle from '$lib/components/icons/PlayCircle.svelte';
  import TerminalIcon from '$lib/components/icons/TerminalIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { selectedFeature } from '$lib/stores/selected-feature';
  import type {
    CartoKitChoroplethLayer,
    CartoKitDotDensityLayer,
    CartoKitProportionalSymbolLayer
  } from '$lib/types/CartoKitLayer';
  import { functionNameRe } from '$lib/utils/regex';
  import { transformationWorker } from '$lib/utils/worker';

  export let onClose: () => void;
  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  // Main editor state.
  let editor: HTMLDivElement;
  let view: EditorView;
  let error = '';
  let success = false;
  let timeoutId: number | undefined;

  // Preview editor state.
  let previewEditor: HTMLDivElement;
  let preview: EditorView;
  let previewError = '';
  let previewDoc: string = $selectedFeature
    ? JSON.stringify(
        {
          type: $selectedFeature.type,
          properties: $selectedFeature.properties,
          geometry: $selectedFeature.geometry
        },
        null,
        2
      )
    : '';

  // Console state.
  let consoleOutput: string[] = [];

  export function focus() {
    view.focus();
  }
  onMount(() => {
    view = new EditorView({
      doc: `function transformGeoJSON(geoJSON) {
  return geoJSON;
}`,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            onChange();
          }
        })
      ],
      parent: editor
    });

    preview = new EditorView({
      doc: previewDoc,
      extensions: [basicSetup, json(), EditorView.editable.of(false)],
      parent: previewEditor
    });
  });

  function onClick() {
    const program = view.state.doc.toString();

    transformationWorker(program, layer.data.geoJSON, (message) => {
      switch (message.type) {
        case 'data': {
          const name = functionNameRe.exec(program);

          dispatchLayerUpdate({
            type: 'transformation',
            layer,
            payload: {
              geoJSON: message.data,
              transformation: {
                name: name ? name[1] : 'anonymous',
                definition: program,
                type: 'statistical'
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

  function onChange() {
    const program = view.state.doc.toString();

    if ($selectedFeature) {
      transformationWorker(
        program,
        turfFeatureCollection([$selectedFeature]),
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
    view.destroy();
    preview.destroy();

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });

  $: if (preview) {
    preview.dispatch({
      changes: { from: 0, to: preview.state.doc.length, insert: previewDoc }
    });
  }
</script>

<Menu class="w-96">
  <MenuItem title="Transform Data">
    <button on:click={onClose} slot="action"><CloseIcon /></button>
    <div class="stack stack-sm">
      <p class="font-sans">
        Use the editor below to transform your dataset using JavaScript.
      </p>
      <div
        bind:this={editor}
        class="transformation-editor -mx-4 overflow-auto bg-white text-black"
      />
      {#if error}
        <TransformationAlert alert={{ kind: 'error', message: error }} />
      {:else if success}
        <TransformationAlert alert={{ kind: 'success' }} />
      {/if}
      <Button
        class="stack-h stack-h-xs items-center self-end"
        on:click={onClick}><span>Run</span><PlayCircle /></Button
      >
    </div>
  </MenuItem>
  <MenuItem title="Preview (1 selected feature)" titleClass="items-baseline">
    <div
      class="transformation-editor relative -mx-4 overflow-auto bg-white text-black"
      bind:this={previewEditor}
    />
    <p slot="action" class="text-slate-400">OUTPUT</p>
    {#if previewError}
      <TransformationAlert alert={{ kind: 'error', message: previewError }} />
    {/if}
  </MenuItem>
  <MenuItem title="Console">
    <ul class="-mx-4 max-h-[148px] overflow-auto">
      {#each consoleOutput as entry}
        <li
          class="border-b border-slate-700 px-4 py-2 text-white first:border-t"
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
