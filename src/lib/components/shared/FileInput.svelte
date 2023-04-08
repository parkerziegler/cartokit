<script lang="ts">
  export let id = '';
  export let onChange: (fileInput: HTMLSpanElement, event: Event) => void;
  export let file: File;

  let fileInput: HTMLSpanElement;
</script>

<label class="file relative inline-block cursor-pointer">
  <input
    {id}
    on:change={(event) => onChange(fileInput, event)}
    type="file"
    tabindex="0"
    class="m-0 min-w-0 opacity-0"
  />
  <span
    class="file-prompt"
    class:file-prompt--uploaded={file}
    bind:this={fileInput}
    data-content="Choose file..."
  />
</label>

<style>
  .file {
    height: 38px;
  }

  .file:focus-within {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .file-prompt {
    @apply absolute top-0 left-0 right-0 z-10 h-full border border-slate-700 bg-inherit p-2 shadow-inner;
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
