<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import CartokitIcon from '$lib/components/icons/CartokitIcon.svelte';
  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
  import MapUploadIcon from '$lib/components/icons/MapUploadIcon.svelte';
  import Alert from '$lib/components/shared/Alert.svelte';
  import Key from '$lib/components/shared/Key.svelte';
  import Menu from '$lib/components/shared/Menu.svelte';
  import Portal from '$lib/components/shared/Portal.svelte';
  import { applyDiff } from '$lib/core/diff';
  import { diffs } from '$lib/state/diffs.svelte';
  import { ir } from '$lib/stores/ir';
  import { registerKeybinding } from '$lib/utils/keybinding';

  let actionPickerActive = $state(false);
  let actionMenu = $state<HTMLDivElement>();
  let fileInput = $state<HTMLInputElement>();
  let files = $state<FileList | null>(null);
  let uploading = $state(false);

  onMount(() => {
    const deregisterDownloadKeybinding = registerKeybinding(
      'D',
      onDownloadMap,
      { requireShift: true }
    );

    const deregisterUploadKeybinding = registerKeybinding(
      'U',
      onInitUploadMap,
      { requireShift: true }
    );

    return () => {
      deregisterDownloadKeybinding();
      deregisterUploadKeybinding();
    };
  });

  function onClickActionPicker() {
    actionPickerActive = true;
  }

  function onClickOutsideActionPicker(event: MouseEvent) {
    if (actionPickerActive && !actionMenu?.contains(event.target as Node)) {
      actionPickerActive = false;
    }
  }

  function onDownloadMap() {
    const camera = {
      center: $ir.center,
      zoom: $ir.zoom
    };

    const blob = new Blob(
      [
        JSON.stringify(
          { cartokitVersion: __CARTOKIT_VERSION__, camera, diffs },
          null,
          2
        )
      ],
      {
        type: 'application/json'
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.ck.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }

  function onUploadMap(file: File) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      uploading = true;

      try {
        const content =
          typeof event.target?.result === 'string'
            ? JSON.parse(event.target.result)
            : null;

        // Apply all diffs in sequence.
        for (const diff of content.diffs) {
          await applyDiff(diff);
        }

        // Update the camera.
        await applyDiff({
          type: 'center',
          payload: {
            center: {
              lng: content.camera.center[0],
              lat: content.camera.center[1]
            }
          }
        });

        await applyDiff({
          type: 'zoom',
          payload: {
            zoom: content.camera.zoom
          }
        });
      } catch (err) {
        console.error('Failed to load map:', err);
      } finally {
        uploading = false;
      }
    };

    reader.readAsText(file, 'UTF-8');
  }

  async function onInitUploadMap() {
    // Mimic the click on the action picker to open the menu.
    onClickActionPicker();

    // Wait for the next tick to ensure state changes are applied.
    await tick();

    // Programmatically click the file input to open the file picker.
    fileInput?.click();
  }

  $effect(() => {
    if (files && files.length === 1) {
      onUploadMap(files[0]);
    }
  });
</script>

<button
  onclick={onClickActionPicker}
  class={[
    'text-ck-light action-picker relative -my-2 flex h-7 items-center gap-1',
    {
      'action-picker--active': actionPickerActive
    }
  ]}
  {@attach onClickOutside({ callback: onClickOutsideActionPicker })}
  data-testid="action-picker-button"
>
  <CartokitIcon />
  <ChevronIcon />
</button>
{#if actionPickerActive}
  <Menu class="absolute bottom-16 left-0 flex w-48 flex-col gap-2 p-2">
    <div class="self-end">
      <p class="-pb-1 self-end font-mono text-xs text-slate-400">
        v{__CARTOKIT_VERSION__}
      </p>
    </div>
    <div class="flex flex-col gap-1 pt-3">
      <button
        class="-mx-2 flex items-center justify-between px-2 py-1 hover:bg-slate-700"
        onclick={onDownloadMap}
      >
        <span class="text-sm text-white">Download Map</span>
        <div class="flex items-baseline gap-1">
          <Key>⇧</Key>
          <Key>D</Key>
        </div>
      </button>
      <label
        class="-mx-2 flex items-center justify-between px-2 py-1 text-sm text-white hover:bg-slate-700"
        >Upload Map
        <input
          type="file"
          class="sr-only"
          bind:files
          bind:this={fileInput}
          accept=".json"
        />
        <div class="flex items-baseline gap-1 text-xs">
          <Key>⇧</Key>
          <Key>U</Key>
        </div></label
      >
    </div>
  </Menu>
{/if}
{#if uploading}
  <Portal>
    <div class="fixed inset-0 z-20 bg-[rgba(0,0,0,0.3)]">
      <div
        class="absolute bottom-12 left-4 rounded-md bg-slate-900 p-2 text-xs tracking-wider text-white shadow-lg"
      >
        <Alert kind="info" message="Uploading map..." testId="upload-map-alert">
          {#snippet icon()}
            <MapUploadIcon />
          {/snippet}
        </Alert>
      </div>
    </div></Portal
  >
{/if}

<style lang="postcss">
  @reference 'tailwindcss';

  .action-picker::before,
  .action-picker--active::before {
    @apply absolute top-0 -left-[2%] -z-10 h-10 w-[104%] -translate-y-1.5 rounded-sm bg-transparent transition-colors content-[''];
  }

  .action-picker:hover::before,
  .action-picker--active::before {
    @apply bg-slate-700;
  }
</style>
