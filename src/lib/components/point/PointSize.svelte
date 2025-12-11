<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';

  interface Props {
    layerId: string;
    size: number;
    label: string;
    fieldId: string;
  }

  let { layerId, size, label, fieldId }: Props = $props();

  function onPointSizeChange(value: number): void {
    const diff: CartoKitDiff = {
      type: 'size',
      layerId,
      payload: {
        size: value
      }
    };

    applyDiff(diff);
  }
</script>

<div class="flex items-center gap-2">
  <FieldLabel {fieldId}>{label}</FieldLabel>
  <NumberInput
    id={fieldId}
    min={1}
    value={size}
    onchange={onPointSizeChange}
    class="w-10"
  />
</div>
