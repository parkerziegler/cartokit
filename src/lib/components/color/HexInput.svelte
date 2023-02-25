<script lang="ts">
	import { DEFAULT_FILL } from '$lib/utils/constants';

	export let hex: string;
	export let opacity: number;
	export let onHexChange: (hex: string) => void;
	export let onOpacityChange: (event: Event) => void;

	function validateHex(event: Event) {
		const target = event.target as HTMLInputElement;
		let output = target.value;

		if (!output.startsWith('#')) {
			output = '#' + output;
		}

		if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(output)) {
			onHexChange(output);
		} else {
			onHexChange(DEFAULT_FILL);
		}
	}
</script>

<div
	class="flex border border-transparent hover:border-slate-600 focus-within:border-slate-600 hex-input"
>
	<input class="bg-inherit p-2" size="7" value={hex} on:change={validateHex} />
	<span class="pr-2">
		<input
			type="number"
			class="bg-inherit w-8 text-right py-2 pl-2"
			min="0"
			max="100"
			value={opacity}
			on:change={onOpacityChange}
		/>
		%
	</span>
</div>
