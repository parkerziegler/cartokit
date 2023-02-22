<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	type T = $$Generic;
	interface SelectOption<T> {
		value: T;
		label: string;
	}

	export let className: string = '';
	export let selected: T;
	export let disabled: boolean = false;
	export let options: SelectOption<T>[] = [];

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
		<option value={option.value} selected={option.value === selected}>{option.label}</option>
	{/each}
</select>
