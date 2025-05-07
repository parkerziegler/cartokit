<!-- Core implementation adapted from: https://svelte.dev/playground/modal -->
<script lang="ts">
  import cs from 'classnames';
  import type { Snippet } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';

  interface Props {
    showModal?: boolean;
    initialHeight?: number;
    class?: string;
    testId?: string;
    header?: Snippet;
    children: Snippet;
  }

  let {
    showModal = $bindable(undefined),
    initialHeight = 0,
    class: className,
    testId = '',
    header,
    children
  }: Props = $props();
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
        <CloseIcon />
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
