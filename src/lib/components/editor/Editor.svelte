<script lang="ts">
  import DataTable from '$lib/components/editor/DataTable.svelte';
  import Program from '$lib/components/editor/Program.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedLayer } from '$lib/stores/selected-layer';

  $: layer = $selectedLayer ?? Object.values($ir.layers)[0];
  $: data = layer?.data.geoJSON.features ?? [];
</script>

<div class="z-10 col-span-4 flex flex-col overflow-hidden shadow-lg">
  <Program />
  {#if layer}
    <DataTable {data} tableName={layer.data.fileName ?? layer.displayName} />
  {/if}
</div>
