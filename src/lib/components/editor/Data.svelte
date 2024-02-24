<script lang="ts">
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedLayer } from '$lib/stores/selected-layer';

  let layer = $selectedLayer || Object.values($ir.layers)[0];
  $: data = layer?.data.geoJSON.features ?? [];

  $: options = Object.values($ir.layers).map((lyr) => ({
    value: lyr.id,
    label: lyr.displayName
  }));

  const onChange = (event: CustomEvent<{ value: string }>): void => {
    layer = $ir.layers[event.detail.value];
  };
</script>

{#if layer}
  <div class="flex flex-col font-mono text-xs text-white">
    <Select
      {options}
      selected={layer.id}
      on:change={onChange}
      title="Select Layer"
      containerClass="px-4 py-2"
    />
    <DataTable {data} />
  </div>
{:else}
  <div class="m-8 w-full border border-slate-600"></div>
{/if}
