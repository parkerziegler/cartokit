<script lang="ts">
	import MapTypeCard from '$lib/components/map-types/MapTypeCard.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';

	export let layers: string[] = [];

	let showModal = false;
	let currentStep: 'add-layer' | 'add-choropleth-layer' = 'add-layer';

	const onClick = () => {
		showModal = true;
	};

	const onClickChoropleth = () => {
		currentStep = 'add-choropleth-layer';
	};

	const onClose = () => {
		showModal = false;
		currentStep = 'add-layer';
	};
</script>

<div class="flex items-baseline justify-between mb-6">
	<p class="text-lg font-semibold">Layers</p>
	<button on:click={onClick}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line
				x1="8"
				y1="12"
				x2="16"
				y2="12"
			/></svg
		>
	</button>
</div>
<ul class="flex flex-col stack stack-sm">
	{#each layers as layer}
		<li>
			<h3 class="text-md font-semibold">{layer}</h3>
		</li>
	{/each}
</ul>
{#if showModal}
	{#if currentStep === 'add-layer'}
		<Modal on:close={onClose}>
			<h2 slot="header" class="text-xl font-semibold">Add Layer</h2>
			<div slot="body" class="grid grid-cols-12">
				<MapTypeCard mapType="Choropleth" on:click={onClickChoropleth} className="col-span-6" />
			</div>
		</Modal>
	{/if}
	{#if currentStep === 'add-choropleth-layer'}
		<Modal on:close={onClose}>
			<h2 slot="header" class="text-xl font-semibold">Add Choropleth Layer</h2>
		</Modal>
	{/if}
{/if}
