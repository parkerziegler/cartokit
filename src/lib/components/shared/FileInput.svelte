<script lang="ts">
  import cs from 'classnames';

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
    class="min-w-0 m-0 opacity-0"
  />
  <span
    class={cs('file-prompt', file && 'file-prompt--uploaded')}
    bind:this={fileInput}
    data-content="Choose file..."
  />
</label>

<style>
  .file {
    height: 34px;
  }

  .file:focus-within {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .file-prompt {
    @apply absolute top-0 left-0 right-0 h-full border border-slate-700 z-10 p-2 bg-inherit shadow-inner;
    line-height: 1.5;
  }

  .file-prompt:hover {
    @apply border-slate-600;
  }

  .file-prompt::before {
    @apply absolute block z-20 p-2 text-white bg-slate-700;
    content: 'Browse';
    top: -0.075rem;
    right: -0.075rem;
    bottom: -0.075rem;
    line-height: 1.5;
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
