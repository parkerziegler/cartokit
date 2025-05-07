<script lang="ts">
  import type { Snippet } from 'svelte';

  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';

  interface Props {
    class?: string;
    showDialog?: boolean;
    header?: Snippet;
    children: Snippet;
  }

  let {
    class: className,
    showDialog = $bindable(false),
    header,
    children
  }: Props = $props();
  let dialog: HTMLDialogElement;

  $effect(() => {
    if (dialog && showDialog) {
      dialog.show();
    } else if (dialog && !showDialog) {
      dialog.close();
    }
  });
</script>

<dialog
  class={[
    'overflow-hidden rounded bg-slate-900 font-sans text-white',
    className
  ]}
  bind:this={dialog}
  onclose={() => (showDialog = false)}
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
>
  <div class="flex items-center justify-between px-4 py-2">
    {@render header?.()}
    <button onclick={() => dialog?.close()} aria-label="Close">
      <CloseIcon />
    </button>
  </div>
  {@render children()}
</dialog>

<style>
  dialog[open] {
    animation:
      slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      fade 0.15s ease-out;
  }

  @keyframes slide {
    from {
      transform: translateX(10px);
    }
    to {
      transform: translateX(0);
    }
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
