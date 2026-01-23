<script lang="ts">
  import Key from '$lib/components/shared/Key.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { diffs } from '$lib/state/diffs.svelte';
  import { ir } from '$lib/stores/ir';

  interface Props {
    actionMenu?: HTMLDivElement;
  }

  let { actionMenu = $bindable() }: Props = $props();

  let files: FileList | null = $state(null);

  function onDownloadMap() {
    const meta = {
      center: $ir.center,
      zoom: $ir.zoom
    };

    const blob = new Blob([JSON.stringify({ meta, diffs }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.ck';
    a.click();
    URL.revokeObjectURL(url);
  }

  function onUploadMap(file: File) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      try {
        const content =
          typeof event.target?.result === 'string'
            ? JSON.parse(event.target.result)
            : null;

        // Apply diff to update center.
        await applyDiff({
          type: 'center',
          payload: {
            center: {
              lng: content.meta.center[0],
              lat: content.meta.center[1]
            }
          }
        });

        // Apply diff to update zoom.
        await applyDiff({
          type: 'zoom',
          payload: {
            zoom: content.meta.zoom
          }
        });

        // Now apply all other diffs.
        for (const diff of content.diffs) {
          await applyDiff(diff);
        }
      } catch (err) {
        // Optionally, add error handling here
        console.error('Failed to load map:', err);
      }
    };

    reader.readAsText(file, 'UTF-8');
  }

  $effect(() => {
    console.log('files', files);
    if (files && files.length === 1) {
      onUploadMap(files[0]);
    }
  });
</script>

<Menu class="absolute bottom-16 left-0 flex w-48 flex-col gap-2 p-2">
  <div class="self-end">
    <p class="-pb-1 self-end font-mono text-xs text-slate-400">
      v{__CARTOKIT_VERSION__}
    </p>
  </div>
  <div class="flex flex-col gap-1 pt-3">
    <button
      class="-mx-2 flex items-center justify-between px-2 py-1 hover:bg-slate-600"
      onclick={onDownloadMap}
    >
      <span class="text-sm text-white">Download Map</span>
      <div class="flex items-baseline gap-1">
        <Key>⇧</Key>
        <Key>D</Key>
      </div>
    </button>
    <div
      class="-mx-2 flex items-center justify-between px-2 py-1 hover:bg-slate-600"
    >
      <label class="flex-1 text-sm text-white" for="upload-map"
        >Upload Map</label
      >
      <input type="file" id="upload-map" class="sr-only" bind:files />
      <div class="flex items-baseline gap-1">
        <Key>⇧</Key>
        <Key>U</Key>
      </div>
    </div>
  </div>
</Menu>
