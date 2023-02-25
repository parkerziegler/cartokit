<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import cs from 'classnames';

	export let className: string = '';

	const dispatch = createEventDispatcher();
	function click() {
		dispatch('click');
	}
</script>

<button on:click={click} class={cs('text-white text-xs bg-slate-700 p-2 rounded', className)}
	><slot /></button
>
