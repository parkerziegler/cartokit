<script lang="ts">
  import Select from '$lib/components/shared/Select.svelte';
  import { dispatchLayerUpdate } from '$lib/interaction/update';
  import { map } from '$lib/stores/map';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import { selectedFeature } from '$lib/stores/feature';
  import { hasAttribute } from '$lib/types/CartoKitLayer';
  import { selectNumericAttribute } from '$lib/utils/geojson';

  $: options = Object.keys($selectedFeature?.properties ?? {}).map(
    (attribute) => ({
      value: attribute,
      label: attribute
    })
  );
  $: selected =
    $selectedLayer && hasAttribute($selectedLayer)
      ? $selectedLayer.attribute
      : $selectedLayer
      ? selectNumericAttribute($selectedLayer.data.geoJSON.features)
      : 'Select Attrribute';

  function onChange(event: CustomEvent<{ value: string }>) {
    const attribute = event.detail.value;

    if ($map && $selectedLayer) {
      dispatchLayerUpdate({
        type: 'attribute',
        map: $map,
        layer: $selectedLayer,
        payload: {
          attribute
        }
      });
    }
  }
</script>

<Select {options} {selected} on:change={onChange} />
