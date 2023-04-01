<script lang="ts">
  import Prism from 'prismjs';

  import { program } from '$lib/stores/program';

  let programVisible = false;
  $: formattedProgram = Prism.highlight(
    $program,
    Prism.languages.javascript,
    'javascript'
  );

  function onClick() {
    programVisible = !programVisible;
  }
</script>

<div class="flex justify-between">
  <p class="text-sm">index.js</p>
  <button on:click={onClick}>
    {#if programVisible}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
          cx="12"
          cy="12"
          r="3"
        /></svg
      >
    {:else}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-eye-off"
        ><path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        /><line x1="1" y1="1" x2="23" y2="23" /></svg
      >
    {/if}
  </button>
</div>
{#if programVisible}
  <pre class="mt-2 overflow-auto">{@html formattedProgram}</pre>
{/if}
