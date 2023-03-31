<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Button from './Button.svelte';

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  let modal: HTMLDivElement;

  const handle_keydown = (event: KeyboardEvent) => {
    // Close the modal on Escape.
    if (event.key === 'Escape') {
      close();
      return;
    }

    // Trap focus within the modal.
    if (event.key === 'Tab') {
      const nodes = modal.querySelectorAll<HTMLElement>('*');
      const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

      let index = document.activeElement
        ? tabbable.indexOf(document.activeElement as HTMLElement)
        : -1;
      if (index === -1 && event.shiftKey) index = 0;

      index += tabbable.length + (event.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      event.preventDefault();
    }
  };

  const previously_focused =
    typeof document !== 'undefined' && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      (previously_focused as HTMLElement).focus();
    });
  }
</script>

<svelte:window on:keydown={handle_keydown} />

<div
  class="modal fixed left-1/2 top-1/2 max-w-2xl overflow-auto -translate-x-1/2 -translate-y-1/2 font-sans rounded bg-slate-900 z-10"
  role="dialog"
  aria-modal="true"
  bind:this={modal}
>
  <slot name="header" />
  <slot name="body" />

  <!-- svelte-ignore a11y-autofocus -->
  <!-- <Button on:click={close} className="self-end">Close</Button> -->
</div>

<style>
  .modal {
    width: calc(100vw - 4em);
    max-height: calc(100vh - 4em);
  }
</style>
