<script lang="ts">
	import { percentToDecimal } from '$lib/utils/color';

	export let opacity: number;
	export let onOpacityChange: (opacity: number) => void;

	function validateOpacity(event: Event) {
		const target = event.target as HTMLInputElement;
		let output = target.value;

		if (output.endsWith('%')) {
			output = output.replace('%', '');
		}

		if (Number.isNaN(+output)) {
			onOpacityChange(1);
		} else {
			onOpacityChange(percentToDecimal(Math.min(100, Math.max(0, +output))));
		}
	}
</script>

<input
	size="4"
	class="bg-inherit text-right p-2 border border-transparent hover:border-slate-600 focus:border-slate-600"
	value={`${opacity}%`}
	on:change={validateOpacity}
/>
