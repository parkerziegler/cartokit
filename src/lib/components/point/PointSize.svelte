<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';

  export let layerId: string;
  export let size: number;
  export let label: string;
  export let fieldId: string;

  function onPointSizeChange(event: CustomEvent<{ value: number }>): void {
    dispatchLayerUpdate({
      type: 'point-size',
      layerId,
      payload: {
        size: event.detail.value
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
    on:change={onPointSizeChange}
    class="w-10"
  />
</div>
