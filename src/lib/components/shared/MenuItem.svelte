<script lang="ts">
	export let title: string;
</script>

<div class="flex stack stack-xs font-mono text-white text-xs p-4">
	<p class="text-base font-medium font-sans tracking-wider">{title}</p>
	<slot />
</div>
