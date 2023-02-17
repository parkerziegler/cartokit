<script lang="ts">
	export let title: string;
</script>

<div class="flex stack stack-xs font-mono text-white text-xs p-4">
	<p class="text-sm font-medium tracking-wider">{title}</p>
	<slot />
</div>
