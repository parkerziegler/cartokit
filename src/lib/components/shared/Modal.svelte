<!-- Core implementation adapted from: https://svelte.dev/examples/modal -->
<script lang="ts">
  import cs from 'classnames';
  /* eslint-disable import/no-duplicates */
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  /* eslint-enable import/no-duplicates */

  export let showModal: boolean;
  export let initialHeight = 0;
  let className = '';
  export { className as class };
  export let testId: string | undefined = undefined;

  let dialog: HTMLDialogElement;
  let offsetHeight: number;
  let offsetHeightTween = tweened(initialHeight, {
    duration: 150,
    easing: cubicOut
  });

  $: if (dialog && showModal) {
    dialog.showModal();
  } else if (dialog && !showModal) {
    dialog.close();
  }

  $: if (dialog && offsetHeight) {
    offsetHeightTween.set(offsetHeight);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  class={cs(
    'overflow-hidden rounded bg-slate-900 font-sans text-white',
    className
  )}
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
  data-testid={testId}
  style="height: {$offsetHeightTween}px;"
>
  <div bind:offsetHeight>
    <div class="flex items-center justify-between p-4">
      <slot name="header" />
      <button on:click={() => dialog.close()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <slot name="body" />
  </div>
</dialog>

<style>
  dialog {
    width: calc(100vw - 4em);
    max-height: calc(100vh - 4em);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
