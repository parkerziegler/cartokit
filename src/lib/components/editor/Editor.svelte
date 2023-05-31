<script lang="ts">
  import DataTable from '$lib/components/editor/DataTable.svelte';
  import Program from '$lib/components/editor/Program.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedLayer } from '$lib/stores/selected-layer';

  $: data = $selectedLayer
    ? $selectedLayer.data.geoJSON.features
    : Object.values($ir.layers)[0]?.data.geoJSON.features ?? [];
</script>

<div class="col-span-4 flex flex-col overflow-hidden">
  <Program />
  <DataTable {data} />
</div>
