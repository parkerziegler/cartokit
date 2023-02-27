<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import cs from 'classnames';

	type T = $$Generic;

	interface SelectOption<T> {
		value: T;
		label: string;
	}

	export let className: string = '';
	export let selected: T;
	export let options: SelectOption<T>[] = [];
	export let title: string = '';

	const dispatch = createEventDispatcher();

	function onChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('change', { value: target.value });
	}
</script>

{#if title}
	<div class="stack-h stack-h-xs items-baseline">
		<p class="font-sans text-slate-400 text-sm underline decoration-dotted py-2">
			{title}
		</p>
		<select
			class={cs(
				'bg-inherit p-2 border border-transparent hover:border-slate-600 focus:border-slate-600',
				className
			)}
			bind:value={selected}
			on:change={onChange}
		>
			{#each options as option}
				<option value={option.value} selected={option.value === selected}>{option.label}</option>
			{/each}
		</select>
	</div>
{:else}
	<select
		class={cs(
			'bg-inherit p-2 border border-transparent hover:border-slate-600 focus:border-slate-600',
			className
		)}
		bind:value={selected}
		on:change={onChange}
	>
		{#each options as option}
			<option value={option.value} selected={option.value === selected}>{option.label}</option>
		{/each}
	</select>
{/if}
