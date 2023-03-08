<script lang="ts">
	import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
	import NumberInput from '$lib/components/shared/NumberInput.svelte';

	export let title: string;
	export let value: number;
	export let onRadiusChange: (event: CustomEvent<{ value: number }>) => void;
</script>

<FieldLabel fieldId={title}>{title}</FieldLabel>
<NumberInput min={1} max={Infinity} size={4} {value} on:change={onRadiusChange} />
