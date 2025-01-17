<!-- Core implementation adapted from: https://svelte.dev/playground/modal -->
<script lang="ts">
  import cs from 'classnames';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  let {
    showModal = $bindable(),
    initialHeight,
    class: className,
    testId = '',
    header,
    children
  } = $props();
  let dialog: HTMLDialogElement;
  let offsetHeight = $state(0);

  let offsetHeightTween = new Tween(initialHeight, {
    duration: 150,
    easing: cubicOut
  });

  $effect(() => {
    if (dialog && showModal) {
      dialog.showModal();
    } else if (dialog && !showModal) {
      dialog.close();
    }
  });

  $effect(() => {
    if (dialog && offsetHeight) {
      offsetHeightTween.set(offsetHeight);
    }
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  class={cs(
    'overflow-hidden rounded bg-slate-900 font-sans text-white',
    className
  )}
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      dialog.close();
    }
  }}
  data-testid={testId}
  style="height: {offsetHeightTween.current}px;"
>
  <div bind:offsetHeight>
    <div class="flex items-center justify-between p-4">
      {@render header?.()}
      <button onclick={() => dialog?.close()} aria-label="Close">
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
    {@render children()}
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
