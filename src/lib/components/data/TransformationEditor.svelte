<script lang="ts">
  import * as turf from '@turf/turf';
  import { EditorView } from 'codemirror';
  import * as Comlink from 'comlink';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import type maplibregl from 'maplibre-gl';

  import JavaScriptIcon from '$lib/components/icons/JavaScriptIcon.svelte';
  import TerminalIcon from '$lib/components/icons/TerminalIcon.svelte';
  import TypeScriptIcon from '$lib/components/icons/TypeScriptIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import MenuItem from '$lib/components/shared/MenuItem.svelte';
  import { parseStringToTransformation } from '$lib/utils/parse';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import { pluralize } from '$lib/utils/formatters/shared';
  import { backend } from '$lib/stores/backend';
  import type { TransformationCall } from '$lib/types/transformation';

  interface Props {
    layerId: string;
    transformations: TransformationCall[];
    map: maplibregl.Map;
  }

  let { layerId, transformations, map }: Props = $props();

  let view: EditorView | undefined = $state();
  let processing = $state(false);
  let applied = $state(false);
  let error = $state('');
  // Internal transformations (e.g., dot density generation) are 'geometric';
  // user-defined ones from this editor are 'user'.
  const appliedTransformation = $derived(
    transformations.findLast(({ kind }) => kind === 'user')
  );
  const doc = $derived(
    appliedTransformation
      ? `function ${appliedTransformation.name}(${appliedTransformation.params.join(', ')}) ${appliedTransformation.definitionTS}\n\n\n`
      : `function transformGeojson(geojson) {
  return geojson;
}\n\n\n`
  );
  let previewDoc: string = $state('');
  let consoleOutput: string[] = $state([]);
  let featureCount = $state(0);

  function getViewportFeatures(): Feature<Geometry>[] {
    return map.queryRenderedFeatures({ layers: [layerId] }).map((feature) => ({
      type: 'Feature',
      id: feature.id,
      properties: feature.properties,
      geometry: feature.geometry
    }));
  }

  function registerTransformationWorker() {
    const worker = new Worker(
      new URL('$lib/utils/transformation/worker.ts', import.meta.url),
      { type: 'module' }
    );

    const { runTransformation } = Comlink.wrap<{
      runTransformation: (
        program: string,
        featureCollection: FeatureCollection,
        onconsole?: (args: unknown[]) => void
      ) => FeatureCollection;
    }>(worker);

    return { worker, runTransformation };
  }

  async function onClick() {
    const program = view?.state.doc.toString() ?? '';

    try {
      processing = true;
      // Reset so a subsequent apply re-triggers the button's success state.
      applied = false;

      const transformation = {
        ...parseStringToTransformation(program, 'user'),
        args: []
      };

      const diff: CartoKitDiff = {
        type: 'add-transformation',
        layerId,
        payload: { transformation }
      };

      await applyDiff(diff);

      applied = true;
      error = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred.';
    } finally {
      processing = false;
    }
  }

  async function onEditorChange(program: string) {
    const viewportFeatures = getViewportFeatures();

    if (viewportFeatures.length > 0) {
      const { worker, runTransformation } = registerTransformationWorker();
      consoleOutput = [];

      try {
        const output = await runTransformation(
          program,
          turf.featureCollection(viewportFeatures),
          Comlink.proxy((args: unknown[]) => {
            consoleOutput = args.map((entry) => JSON.stringify(entry, null, 2));
          })
        );

        featureCount = output.features.length;
        previewDoc = JSON.stringify(output, null, 2);
        error = '';
      } catch (err) {
        error = err instanceof Error ? err.message : 'An error occurred.';
      } finally {
        worker.terminate();
      }
    }
  }

  $effect(() => {
    if (view) {
      onEditorChange(view?.state.doc.toString());
    }
  });
</script>

<MenuItem
  title="Transform Data"
  containerClass="shrink-0 pb-0"
  titleClass="items-center"
>
  {#snippet action()}
    {#if $backend.language === 'typescript'}
      <TypeScriptIcon />
    {:else}
      <JavaScriptIcon />
    {/if}
  {/snippet}
  <div class="flex flex-col">
    <CodeEditor
      config={{
        kind: 'editable',
        initialDoc: doc,
        language: 'javascript',
        onchange: onEditorChange
      }}
      class="-mx-4 max-h-38 overflow-auto border-b-transparent"
      bind:view
      testId="transformation-editor"
    />
    <div
      class="relative flex w-full justify-end pb-2 after:absolute after:-top-px after:left-8 after:h-[calc(100%+1px)] after:w-px after:bg-slate-600 after:content-['']"
    >
      <Button
        class="px-2! py-1! font-sans! text-xs!"
        onclick={onClick}
        disabled={!!error}
        loading={processing}
        success={applied}
        testId="apply-transformation-button">Apply</Button
      >
    </div>
  </div>
</MenuItem>
<MenuItem
  title="Output Preview"
  containerClass="min-h-0 flex-1 pb-0"
  titleClass="items-baseline!"
>
  <CodeEditor
    config={{ kind: 'readonly', doc: previewDoc, language: 'json' }}
    class={['-mx-4 overflow-auto', { 'opacity-60': error }]}
  />
  {#snippet action()}
    <p class="text-3xs text-slate-400 uppercase">
      {featureCount}
      {pluralize('Feature', featureCount)} in Viewport
    </p>
  {/snippet}
</MenuItem>
<MenuItem title="Console" containerClass="shrink-0 border-t-transparent!">
  <ul class="-mx-4 max-h-38 overflow-auto">
    {#each consoleOutput as entry, i (`${entry}-${i}`)}
      <li class="border-b border-slate-700 px-4 py-2 text-white first:border-t">
        {entry}
      </li>
    {/each}
    <li class="px-4 py-2 text-white">
      <TerminalIcon />
    </li>
  </ul>
</MenuItem>
