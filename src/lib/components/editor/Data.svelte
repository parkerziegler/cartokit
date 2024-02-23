<script lang="ts">
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import Select from '$lib/components/shared/Select.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedLayer } from '$lib/stores/selected-layer';

  let layer: CartoKitLayer = $selectedLayer || Object.values($ir.layers)[0];
  $: data = layer?.data.geoJSON.features ?? [];

  $: options = Object.values($ir.layers).map((lyr) => ({
    value: lyr.id,
    label: lyr.displayName
  }));

  const onChange = (event: CustomEvent<{ value: string }>) => {
    layer = $ir.layers[event.detail.value];
  };
</script>

{#if layer}
  <div class="flex w-full flex-col font-mono text-xs text-white">
    <Select
      {options}
      selected={layer.id}
      on:change={onChange}
      title="Select a layer"
      containerClass="px-4 py-2"
    />
    <DataTable {data} />
  </div>
{:else}
  <div class="h-full w-full border border-slate-600"></div>
{/if}
