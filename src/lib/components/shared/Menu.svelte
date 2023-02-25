<script lang="ts">
	import cs from 'classnames';

	export let className: string = '';
</script>

<div class={cs('stack-border bg-slate-900 rounded-md', className)}>
	<slot />
</div>
