<script lang="ts">
  import type { BufferTransformation } from '$lib/types/transformation';

  interface Props {
    args: BufferTransformation['args'];
  }

  let { args = $bindable() }: Props = $props();

  const fieldId = 'buffer-distance-input';
</script>

<div class="flex items-center justify-between px-2 py-1 text-white">
  <label class="text-slate-400" for={fieldId}>Distance (m)</label>
  <input
    id={fieldId}
    type="number"
    bind:value={args.distance}
    class="w-16 border border-transparent bg-inherit p-1 text-right hover:border-slate-600 focus:border-slate-600"
  />
</div>
