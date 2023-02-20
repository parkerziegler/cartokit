<script lang="ts">
	import ColorScaleSelect from '$lib/components/color/ColorScaleSelect.svelte';

	let selectedColor: string = '#FFFFFF';
	let colors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];
	let opacity = 100;

	function onColorInput(event: Event, i: number) {
		const target = event.target as HTMLInputElement;
		colors[i] = target.value;
	}

	function onOpacityChange(event: Event) {}
</script>

<div class="font-mono text-xs text-white stack stack-xs">
	<ColorScaleSelect />
	<div class="stack-h stack-xs">
		<ul class="color-palette flex">
			{#each colors as color, i}
				<li>
					<input
						type="color"
						class="appearance-none cursor-pointer bg-transparent p-0 h-4 w-4"
						bind:value={color}
						on:input={(event) => onColorInput(event, i)}
					/>
				</li>
			{/each}
		</ul>
		<input class="bg-inherit pl-2" size="7" bind:value={selectedColor} />
		<span>
			<input
				type="number"
				class="bg-inherit w-8 text-right"
				min="0"
				max="100"
				bind:value={opacity}
				on:change={onOpacityChange}
			/>
			%
		</span>
	</div>
</div>
