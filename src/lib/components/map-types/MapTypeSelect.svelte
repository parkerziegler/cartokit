<script lang="ts">
	import { mapType } from '$lib/stores/map-type';
	import { MAP_TYPES, type MapType } from '$lib/types/MapTypes';
	import Select from '$lib/components/shared/Select.svelte';

	function onChange(event: CustomEvent<{ value: MapType }>) {
		mapType.set(event.detail.value);
	}
</script>

<Select options={[...MAP_TYPES]} selected={$mapType} on:change={onChange} disabled={!$mapType} />
