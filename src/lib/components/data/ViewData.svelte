<script lang="ts">
  import { onMount } from 'svelte';

  import { tooltip } from '#lib/attachments/tooltip.ts';
  import TableIcon from '#lib/components/icons/TableIcon.svelte';
  import { layout } from '#lib/stores/layout.ts';
  import { registerKeybinding } from '#lib/utils/keybinding.ts';

  function onViewDataClick() {
    layout.update((layout) => {
      layout.dataVisible = !layout.dataVisible;

      return layout;
    });
  }

  onMount(() => {
    const deregisterKeybinding = registerKeybinding('t', onViewDataClick);

    return deregisterKeybinding;
  });
</script>

<button
  class={['transition-colors', { 'text-ck-light': $layout.dataVisible }]}
  onclick={onViewDataClick}
  {@attach tooltip({
    content: 'View Data Table',
    keybinding: 'T',
    placement: 'bottom'
  })}
>
  <TableIcon />
</button>
