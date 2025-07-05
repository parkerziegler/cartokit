<script lang="ts">
  import * as d3 from 'd3';

  import { DEFAULT_FILL } from '$lib/utils/constants';

  interface Props {
    hex: string;
    testId: string;
    onHexChange: (hex: string) => void;
  }

  let { hex, testId, onHexChange }: Props = $props();
  const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/i;

  function validateHex(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    let output = event.currentTarget.value;

    if (!output.startsWith('#')) {
      output = '#' + output;
    }

    if (hexPattern.test(output)) {
      onHexChange(d3.color(output)?.formatHex() ?? DEFAULT_FILL);
    } else {
      onHexChange(DEFAULT_FILL);
    }
  }
</script>

<input
  size="7"
  bind:value={hex}
  onchange={validateHex}
  class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
  data-testid={testId}
/>
