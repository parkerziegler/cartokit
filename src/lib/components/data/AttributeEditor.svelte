<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { basicSetup, EditorView } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';

  import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import PlayCircle from '$lib/components/icons/PlayCircle.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import type {
    CartoKitChoroplethLayer,
    CartoKitDotDensityLayer,
    CartoKitProportionalSymbolLayer
  } from '$lib/types/CartoKitLayer';
  import { transformationWorker } from '$lib/utils/worker';
  import { dispatchLayerUpdate } from '$lib/interaction/update';

  export let onClose: () => void;
  export let layer:
    | CartoKitChoroplethLayer
    | CartoKitProportionalSymbolLayer
    | CartoKitDotDensityLayer;

  let editor: HTMLDivElement;
  let view: EditorView;
  let error: string = '';
  let success: boolean = false;
  let timeoutId: number | undefined;

  const doc = `function(features) {
  return features;
}`;

  onMount(() => {
    view = new EditorView({
      doc,
      extensions: [basicSetup, javascript()],
      parent: editor
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

  onDestroy(() => {
    view.destroy();

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });
</script>

<Menu class="w-96">
  <MenuItem title="Transform Data">
    <button on:click={onClose} slot="action"><CloseIcon /></button>
    <div class="stack stack-sm">
      <p class="font-sans">
        Use the editor below to add new attributes to your dataset.
      </p>
      <div bind:this={editor} class="-mx-4 overflow-auto bg-white text-black" />
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
</Menu>
