<script lang="ts">
  import { DEFAULT_FILL } from '$lib/utils/constants';

  export let hex: string;
  export let testId: string;
  export let onHexChange: (hex: string) => void;
  const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/i;

  function validateHex(event: Event) {
    const target = event.target as HTMLInputElement;
    let output = target.value;

    if (!output.startsWith('#')) {
      output = '#' + output;
    }

    if (hexPattern.test(output)) {
      onHexChange(output);
    } else {
      onHexChange(DEFAULT_FILL);
    }
  }
</script>

<input
  size="7"
  value={hex}
  on:change={validateHex}
  class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
  data-testid={testId}
/>
