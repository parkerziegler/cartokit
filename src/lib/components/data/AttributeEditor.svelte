<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { basicSetup, EditorView } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';

  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import PlayCircle from '$lib/components/icons/PlayCircle.svelte';
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
  import { transformationWorker } from '$lib/utils/worker';

  export let onClose: () => void;
  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  // Main editor state.
  let editor: HTMLDivElement;
  let view: EditorView;
  let error: string = '';
  let success: boolean = false;

  // Preview editor state.
  let editorPreview: HTMLDivElement;
  let preview: EditorView;
  let previewError: string = '';
  let previewDoc: string = JSON.stringify(
    {
      type: $selectedFeature?.type,
      properties: $selectedFeature?.properties,
      geometry: $selectedFeature?.geometry
    },
    null,
    2
  );
  let timeoutId: number | undefined;

  export function focus() {
    view.focus();
  }
  onMount(() => {
    view = new EditorView({
      doc: `function transformFeatures(features) {
  return features;
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
      parent: editorPreview
    });
  });

  function onClick() {
    const program = view.state.doc.toString();

    transformationWorker(program, layer.data.geoJSON.features, (message) => {
      if (message.type === 'data') {
        dispatchLayerUpdate({
          type: 'computed-attribute',
          layer,
          payload: {
            features: message.data
          }
        });

        success = true;
        // Clear any errors on successful transformation.
        error = '';

        // Set a timeout to hide the success message.
        timeoutId = window.setTimeout(() => {
          success = false;
        }, 3000);
      } else {
        success = false;
        error = message.error.message;
      }
    });
  }

  function onChange() {
    const program = view.state.doc.toString();

    if ($selectedFeature) {
      transformationWorker(program, [$selectedFeature], (message) => {
        if (message.type === 'data' && message.data?.[0]) {
          previewError = '';

          previewDoc = JSON.stringify(
            {
              type: message.data[0].type,
              properties: message.data[0].properties,
              geometry: message.data[0].geometry
            },
            null,
            2
          );
        } else if (message.type === 'data') {
          previewError = '';

          previewDoc = JSON.stringify(message.data?.[0], null, 2);
        } else {
          previewDoc = '';
          previewError = message.error.message;
        }
      });
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
        <div class="stack stack-xs" transition:slide>
          <div
            class="stack stack-xs rounded border border-red-400 bg-red-400 bg-opacity-50 px-2 py-1"
          >
            <div class="stack-h stack-h-xs items-center">
              <AlertIcon />
              <p class="font-sans">Failed to transform data. Original error:</p>
            </div>
            <p>
              {error}
            </p>
          </div>
          <p class="font-sans">
            Try fixing the error and reexecuting the code.
          </p>
        </div>
      {:else if success}
        <div class="stack stack-xs" transition:slide>
          <div
            class="stack-h stack-h-xs items-center rounded border border-green-400 bg-green-400 bg-opacity-50 px-2 py-1"
          >
            <CheckIcon />
            <p>Successfully transformed data.</p>
          </div>
        </div>
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
      bind:this={editorPreview}
    />
    <p slot="action" class="text-slate-400">OUTPUT</p>
    {#if previewError}
      <div
        class="stack stack-xs rounded border border-red-400 bg-red-400 bg-opacity-50 px-2 py-1"
      >
        <div class="stack-h stack-h-xs items-center">
          <AlertIcon />
          <p class="font-sans">Failed to transform data. Original error:</p>
        </div>
        <p>
          {previewError}
        </p>
      </div>
    {/if}
  </MenuItem>
</Menu>
