<script lang="ts">
	export let className: string = '';
</script>

<div class="{className} stack-border bg-slate-900 rounded-md">
	<slot />
</div>
