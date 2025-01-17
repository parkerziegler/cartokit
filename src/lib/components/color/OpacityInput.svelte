<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import type {
    CategoricalStyle,
    Channel,
    ConstantStyle,
    QuantitativeStyle
  } from '$lib/types';
  import { percentToDecimal, decimalToPercent } from '$lib/utils/color';

  interface Props {
    layerId: string;
    channel: Exclude<Channel, 'size' | 'dots'>;
    style: QuantitativeStyle | CategoricalStyle | ConstantStyle;
  }

  let { layerId, channel, style }: Props = $props();

  function validateOpacity(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    let output = event.currentTarget.value;

    if (output.endsWith('%')) {
      output = output.replace('%', '');
    }

    if (Number.isNaN(+output)) {
      onOpacityChange(1);
    } else {
      onOpacityChange(percentToDecimal(Math.min(100, Math.max(0, +output))));
    }
  }

  function onOpacityChange(opacity: number) {
    dispatchLayerUpdate({
      type: `${channel}-opacity`,
      layerId,
      payload: { opacity }
    });
  }
</script>

<div class="stack-h stack-h-xs items-center">
  <FieldLabel fieldId="{channel}-opacity-input">Opacity</FieldLabel>
  <input
    id="{channel}-opacity-input"
    size="4"
    class="border border-transparent bg-inherit p-2 hover:border-slate-600 focus:border-slate-600"
    value="{decimalToPercent(style.opacity)}%"
    onchange={validateOpacity}
  />
</div>
