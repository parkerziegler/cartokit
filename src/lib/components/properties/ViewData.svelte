<script lang="ts">
  import TableIcon from '$lib/components/icons/TableIcon.svelte';
  import { layout } from '$lib/stores/layout';

  function onViewDataClick() {
    layout.update((layout) => {
      layout.dataVisible = !layout.dataVisible;

      return layout;
    });
  }
</script>

<button on:click={onViewDataClick}>
  <TableIcon />
</button>
