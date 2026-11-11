<script lang="ts">
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import type { BufferTransformation } from '$lib/types/transformation';

  interface Props {
    args: BufferTransformation['args'];
  }

  let { args = $bindable() }: Props = $props();

  const fieldId = 'buffer-distance-input';
</script>

<div class="flex items-center justify-between px-2 py-1 text-white">
  <label class="text-slate-400" for={fieldId}>Distance (m)</label>
  <NumberInput
    id={fieldId}
    min={0}
    step={100}
    value={args.distance}
    onchange={(distance) => (args.distance = distance)}
    class="w-16 px-1 py-0.5 text-right"
  />
</div>
