<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import FileInput from '$lib/components/shared/FileInput.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';

  let showModal = false;
  let apiInput = '';
  let apiDisplayName = '';
  let fileDisplayName = '';
  let file: File;

  function onClick() {
    showModal = true;
  }

  function onClose() {
    showModal = false;
  }

  function onAPIInputChange(event: CustomEvent<{ value: string }>) {
    apiInput = event.detail.value;
  }

  function onAPIDisplayNameChange(event: CustomEvent<{ value: string }>) {
    apiDisplayName = event.detail.value;
  }

  function onFileDisplayNameChange(event: CustomEvent<{ value: string }>) {
    fileDisplayName = event.detail.value;
  }

  function onFileUpload(fileInput: HTMLSpanElement, event: Event) {
    const { files } = event.target as HTMLInputElement;

    if (files?.length) {
      file = files[0];

      const name = files[0].name;
      fileInput.setAttribute('data-content', name);
    }
  }
</script>

<button on:click={onClick}>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-plus"
    ><line x1="12" y1="5" x2="12" y2="19" /><line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
    /></svg
  >
</button>
{#if showModal}
  <Modal on:close={onClose}>
    <h2
      slot="header"
      class="text-xl font-semibold p-4 border-b border-b-slate-400"
    >
      Add Layer
    </h2>
    <div slot="body" class="grid upload-grid gap-4 p-4">
      <div class="stack stack-xs">
        <h3 class="text-lg">From API</h3>
        <div class="flex flex-col">
          <FieldLabel fieldId="Endpoint">Endpoint</FieldLabel>
          <TextInput
            on:change={onAPIInputChange}
            value={apiInput}
            placeholder="(e.g., https://www.nps.gov/lib/npmap.js/4.0.0/examples/data/national-parks.geojson)"
            id="Endpoint"
            className="w-full"
          />
        </div>
        <div class="flex flex-col">
          <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
          <TextInput
            on:change={onAPIDisplayNameChange}
            value={apiDisplayName}
            placeholder="(e.g., National Parks)"
            id="Display Name"
            className="w-full"
          />
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 200"
        width="40"
        height="200"
      >
        <line x1="10" y1="0" x2="10" y2="80" stroke="#94a3b8" />
        <circle cx="10" cy="100" r="20" stroke="#94a3b8" fill="none" />
        <text x="1.5" y="104" style="font: italic" fill="white">OR</text>
        <line x1="10" y1="120" x2="10" y2="200" stroke="#94a3b8" />
      </svg>
      <div class="stack stack-xs">
        <h3 class="text-lg">From File</h3>
        <div class="flex flex-col">
          <FieldLabel fieldId="File">File</FieldLabel>
          <FileInput id="File" onChange={onFileUpload} {file} />
        </div>
        <div class="flex flex-col">
          <FieldLabel fieldId="Display Name">Display Name</FieldLabel>
          <TextInput
            on:change={onFileDisplayNameChange}
            value={fileDisplayName}
            placeholder="(e.g., National Parks)"
            id="Display Name"
            className="w-full"
          />
        </div>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .upload-grid {
    grid-template-columns: 1fr 40px 1fr;
  }
</style>
