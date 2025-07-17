<script lang="ts">
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import { history } from '$lib/state/history.svelte';
  import type { CartoKitHeatmapLayer } from '$lib/types';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { DEFAULT_HEATMAP_WEIGHT } from '$lib/utils/constants';
  import { selectQuantitativeAttribute } from '$lib/utils/geojson';
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
    const update = {
      type: 'heatmap-weight-type' as const,
      layerId: layer.id,
      payload: {
        weightType: event.currentTarget.value as 'Constant' | 'Quantitative'
      }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-weight-type',
        layerId: layer.id,
        payload: { weightType: layer.style.heatmap.weight.type }
      }
    });

    dispatchLayerUpdate(update);
  }

  function onWeightAttributeChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) {
    const update = {
      type: 'heatmap-weight-attribute' as const,
      layerId: layer.id,
      payload: { weightAttribute: event.currentTarget.value }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-weight-attribute',
        layerId: layer.id,
        payload: {
          weightAttribute:
            layer.style.heatmap.weight.type === 'Quantitative'
              ? layer.style.heatmap.weight.attribute
              : selectQuantitativeAttribute(layer.data.geojson.features)
        }
      }
    });

    dispatchLayerUpdate(update);
  }

  function onWeightBoundsChange(field: 'min' | 'max') {
    return function handleWeightBoundsChange(value: number) {
      const update = {
        type: 'heatmap-weight-bounds' as const,
        layerId: layer.id,
        payload: {
          [field]: value
        }
      };

      history.undo.push({
        execute: update,
        invert: {
          type: 'heatmap-weight-bounds',
          layerId: layer.id,
          payload: {
            [field]:
              layer.style.heatmap.weight.type === 'Quantitative'
                ? layer.style.heatmap.weight[field]
                : DEFAULT_HEATMAP_WEIGHT
          }
        }
      });

      dispatchLayerUpdate(update);
    };
  }

  function onWeightValueChange(value: number) {
    const update = {
      type: 'heatmap-weight-value' as const,
      layerId: layer.id,
      payload: { value }
    };

    history.undo.push({
      execute: update,
      invert: {
        type: 'heatmap-weight-value',
        layerId: layer.id,
        payload: {
          value:
            layer.style.heatmap.weight.type === 'Constant'
              ? layer.style.heatmap.weight.value
              : DEFAULT_HEATMAP_WEIGHT
        }
      }
    });

    dispatchLayerUpdate(update);
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
    <FieldLabel fieldId="min">Min</FieldLabel>
    <NumberInput
      min={0}
      value={layer.style.heatmap.weight.min}
      onchange={onWeightBoundsChange('min')}
      class="w-10"
    />
  </div>
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="max">Max</FieldLabel>
    <NumberInput
      min={0}
      value={layer.style.heatmap.weight.max}
      onchange={onWeightBoundsChange('max')}
      class="w-10"
    />
  </div>
{:else}
  <div class="flex items-center gap-2">
    <FieldLabel fieldId="min">Value</FieldLabel>
    <NumberInput
      min={0}
      value={layer.style.heatmap.weight.value}
      onchange={onWeightValueChange}
      class="w-10"
    />
  </div>
{/if}
