<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { history } from '$lib/state/history.svelte';

  interface Props {
    layerId: string;
    size: number;
    label: string;
    fieldId: string;
  }

  let { layerId, size, label, fieldId }: Props = $props();

  function onPointSizeChange(value: number): void {
    const update = {
      type: 'point-size' as const,
      layerId,
      payload: {
        size: value
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'point-size',
        layerId,
        payload: {
          size: size
        }
      }
    });

    dispatchLayerUpdate(update);
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
