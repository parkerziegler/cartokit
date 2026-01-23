<script lang="ts">
  import { onClickOutside } from '$lib/attachments/on-click-outside';
  import ActionMenu from '$lib/components/action/ActionMenu.svelte';
  import CartokitIcon from '$lib/components/icons/CartokitIcon.svelte';
  import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';

  let actionPickerActive = $state(false);
  let actionMenu: HTMLDivElement | undefined = $state();

  function onClickActionPicker() {
    actionPickerActive = true;
  }

  function onClickOutsideActionPicker(event: MouseEvent) {
    if (
      actionPickerActive &&
      actionMenu &&
      !actionMenu.contains(event.target as Node)
    ) {
      actionPickerActive = false;
    }
  }
</script>

<button
  onclick={onClickActionPicker}
  class={[
    'text-ck-light action-picker relative -my-2 flex h-7 items-center gap-1',
    {
      'action-picker--active': actionPickerActive
    }
  ]}
  {@attach onClickOutside({ callback: onClickOutsideActionPicker })}
>
  <CartokitIcon />
  <ChevronIcon />
</button>
{#if actionPickerActive}
  <ActionMenu bind:actionMenu />
{/if}

<style lang="postcss">
  @reference 'tailwindcss';

  .action-picker:hover::before,
  .action-picker--active::before {
    @apply absolute top-0 -left-[2%] -z-10 h-10 w-[104%] -translate-y-1.5 rounded-sm bg-slate-600 content-[''];
  }
</style>
