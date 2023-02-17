<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let className: string = '';
	export let selected: string = '';
	export let disabled: boolean = false;
	export let options: string[] = [];

	const dispatch = createEventDispatcher();
	function onChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('change', { value: target.value });
	}
</script>

<select
	class="{className} bg-inherit font-mono text-white text-xs"
	bind:value={selected}
	on:change={onChange}
	{disabled}
>
	{#each options as option}
		<option value={option} selected={option === selected}>{option}</option>
	{/each}
</select>
