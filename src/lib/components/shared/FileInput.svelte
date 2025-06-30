<script lang="ts">
  interface Props {
    id?: string;
    file: File | null;
    onfilechange: (file: File) => void;
  }

  let { id = '', file = null, onfilechange }: Props = $props();

  let files: FileList | null = $state(null);

  $effect(() => {
    if (files) {
      onfilechange(files[0]);
    }
  });
</script>

<label class="file relative inline-block cursor-pointer">
  <input
    {id}
    type="file"
    tabindex="0"
    bind:files
    class="m-0 min-w-0 opacity-0"
    accept=".geojson,.json"
  />
  <span
    class="file-prompt"
    class:file-prompt--uploaded={file?.name}
    data-content={file?.name ?? 'Choose file...'}
  ></span>
</label>

<style lang="postcss">
  @reference 'tailwindcss';

  .file {
    height: 38px;
  }

  .file:focus-within {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .file-prompt {
    @apply absolute top-0 right-0 left-0 z-10 h-full border border-slate-600 bg-inherit p-2 shadow-inner;
  }

  .file-prompt:hover {
    @apply border-slate-600;
  }

  .file-prompt::before {
    @apply absolute z-20 block bg-slate-700 p-2 text-white;
    content: 'Browse';
    top: -0.075rem;
    right: -0.075rem;
    bottom: -0.075rem;
    line-height: 1.75;
  }

  .file-prompt:hover::before {
    @apply bg-slate-600;
  }

  .file-prompt::after {
    @apply text-slate-400;
    content: attr(data-content);
  }

  .file-prompt--uploaded.file-prompt::after {
    @apply text-white;
  }
</style>
