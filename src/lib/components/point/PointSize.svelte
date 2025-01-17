<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';

  interface Props {
    layerId: string;
    size: number;
    label: string;
    fieldId: string;
  }

  let { layerId, size, label, fieldId }: Props = $props();

  function onPointSizeChange(value: number): void {
    dispatchLayerUpdate({
      type: 'point-size',
      layerId,
      payload: {
        size: value
      }
    });
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel {fieldId}>{label}</FieldLabel>
  <NumberInput
    id={fieldId}
    min={1}
    max={Infinity}
    value={size}
    onchange={onPointSizeChange}
    class="w-10"
  />
</div>
