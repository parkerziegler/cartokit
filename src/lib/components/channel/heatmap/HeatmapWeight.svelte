<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { applyDiff, type CartoKitDiff } from '$lib/core/diff';
  import type { CartoKitHeatmapLayer } from '$lib/types';
  import { isPropertyQuantitative } from '$lib/utils/property';

  interface Props {
    layer: CartoKitHeatmapLayer;
  }

  let { layer }: Props = $props();

  const weightTypeOptions = [
    { value: 'Constant', label: 'Constant' },
    { value: 'Quantitative', label: 'Range' }
  ];
  let weightAttributeOptions = $derived(
    layer.style.heatmap.weight.type === 'Quantitative'
      ? Object.keys(layer.data.geojson.features[0].properties ?? {})
          .filter((attribute) =>
            isPropertyQuantitative(
              layer.data.geojson.features[0].properties?.[attribute]
            )
          )
          .map((attribute) => ({
            value: attribute,
            label: attribute
          }))
      : []
  );

  function onWeightTypeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'heatmap-weight-type',
      layerId: layer.id,
      payload: {
        weightType: event.currentTarget.value as 'Constant' | 'Quantitative'
      }
    };

    applyDiff(diff);
  }

  function onWeightAttributeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const diff: CartoKitDiff = {
      type: 'heatmap-weight-attribute',
      layerId: layer.id,
      payload: { weightAttribute: event.currentTarget.value }
    };

    applyDiff(diff);
  }

  function onWeightBoundsMinChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'heatmap-weight-min',
      layerId: layer.id,
      payload: { min: value }
    };

    applyDiff(diff);
  }

  function onWeightBoundsMaxChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'heatmap-weight-max',
      layerId: layer.id,
      payload: { max: value }
    };

    applyDiff(diff);
  }

  function onWeightValueChange(value: number) {
    const diff: CartoKitDiff = {
      type: 'heatmap-weight-value',
      layerId: layer.id,
      payload: { value }
    };

    applyDiff(diff);
  }
</script>

<Select
  title="Style by"
  options={weightTypeOptions}
  selected={layer.style.heatmap.weight.type}
  id="heatmap-style-by-select"
  onchange={onWeightTypeChange}
/>
{#if layer.style.heatmap.weight.type === 'Quantitative'}
  <Select
    title="Attribute"
    options={weightAttributeOptions}
    selected={layer.style.heatmap.weight.attribute}
    id="heatmap-weight-attribute-select"
    onchange={onWeightAttributeChange}
  />
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="heatmap-weight-min">Min</FieldLabel>
    <NumberInput
      id="heatmap-weight-min"
      min={0}
      value={layer.style.heatmap.weight.min}
      onchange={onWeightBoundsMinChange}
      class="w-8"
    />
  </div>
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="heatmap-weight-max">Max</FieldLabel>
    <NumberInput
      id="heatmap-weight-max"
      min={0}
      value={layer.style.heatmap.weight.max}
      onchange={onWeightBoundsMaxChange}
      class="w-8"
    />
  </div>
{:else}
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="heatmap-weight-value">Value</FieldLabel>
    <NumberInput
      id="heatmap-weight-value"
      min={0}
      value={layer.style.heatmap.weight.value}
      onchange={onWeightValueChange}
      class="w-8"
    />
  </div>
{/if}
