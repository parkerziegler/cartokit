<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let className: string = '';

	const dispatch = createEventDispatcher();
	const click = () => dispatch('click');
</script>

<button on:click={click} class="{className} text-white text-xs bg-slate-700 p-2 rounded"
	><slot /></button
>
