<script lang="ts">
  import { onMount } from 'svelte';
  import { on } from 'svelte/events';

  import { tooltip } from '$lib/attachments/tooltip';
  import TableIcon from '$lib/components/icons/TableIcon.svelte';
  import { layout } from '$lib/stores/layout';
  import { registerKeybinding } from '$lib/utils/keybinding';

  function onViewDataClick() {
    layout.update((layout) => {
      layout.dataVisible = !layout.dataVisible;

      return layout;
    });
  }

  onMount(() => {
    const unregisterKeybinding = registerKeybinding('t', onViewDataClick);

    return unregisterKeybinding;
  });
</script>

<button
  onclick={onViewDataClick}
  {@attach tooltip({
    content: 'View Data Table',
    keybinding: 'T',
    placement: 'bottom'
  })}
>
  <TableIcon />
</button>
