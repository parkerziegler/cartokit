<script lang="ts">
  import snakeCase from 'lodash.snakecase';
  import uniqueId from 'lodash.uniqueid';

  import Button from '$lib/components/shared/Button.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import NumberInput from '$lib/components/shared/NumberInput.svelte';
  import Select from '$lib/components/shared/Select.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { addSource } from '$lib/interaction/source';
  import { db } from '$lib/stores/db';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';
  import type { BufferTransformation } from '$lib/types/transformation';
  import { BUFFER_UNITS } from '$lib/utils/constants';

  export let transformation: BufferTransformation;

  $: layerOptions = Object.values($ir.layers).map((layer) => ({
    value: layer.id,
    label: layer.displayName
  }));
  const unitOptions = BUFFER_UNITS.map((unit) => ({
    value: unit,
    label: unit
  }));
  let transformationLoading = false;

  const onLayerChange = (event: CustomEvent<{ value: string }>) => {
    ir.update((ir) => {
      const index = ir.transformations.findIndex(
        (t) => t.id === transformation.id
      );
      ir.transformations[index].layer = ir.layers[event.detail.value];

      return ir;
    });
  };

  const onDistanceChange = (event: CustomEvent<{ value: number }>) => {
    ir.update((ir) => {
      const index = ir.transformations.findIndex(
        (t) => t.id === transformation.id
      );
      ir.transformations[index].settings.distance = event.detail.value;

      return ir;
    });
  };

  const onUnitChange = (
    event: CustomEvent<{ value: (typeof BUFFER_UNITS)[number] }>
  ) => {
    ir.update((ir) => {
      const index = ir.transformations.findIndex(
        (t) => t.id === transformation.id
      );
      ir.transformations[index].settings.units = event.detail.value;

      return ir;
    });
  };

  const onOutputChange = (event: CustomEvent<{ value: string }>) => {
    ir.update((ir) => {
      const index = ir.transformations.findIndex(
        (t) => t.id === transformation.id
      );
      ir.transformations[index].output = event.detail.value;

      return ir;
    });
  };

  const onRun = async () => {
    transformationLoading = true;
    const currTransformation = $ir.transformations.find(
      (t) => t.id === transformation.id
    );

    if (!currTransformation) {
      return;
    }

    const conn = await $db.connect();
    let results;

    if (transformation.settings.units === 'km') {
      results = await conn.query(
        `SELECT * EXCLUDE geom, ST_AsGeoJSON(ST_Transform(ST_Buffer(ST_Transform(geom, 'EPSG:4326', 'EPSG:3857', true), ${transformation.settings.distance * 1000}), 'EPSG:3857', 'EPSG:4326', true)) AS geom
        FROM ${transformation.layer.id};`
      );
    } else {
      results = await conn.query(
        `SELECT * EXCLUDE geom, ST_AsGeoJSON(ST_Buffer(geom, ${transformation.settings.distance})) AS geom
      FROM ${transformation.layer.id};`
      );
    }

    const features = results
      .toArray()
      .map(
        (row: { toJSON: () => { geom: string; [key: string]: unknown } }) => {
          const { geom, ...properties } = row.toJSON();

          return {
            type: 'Feature',
            properties,
            geometry: JSON.parse(geom)
          };
        }
      );

    addSource($map, {
      kind: 'file',
      id: uniqueId(snakeCase(`${transformation.output}__`)),
      displayName: transformation.output,
      fileName: transformation.output,
      featureCollection: {
        type: 'FeatureCollection',
        features
      }
    });

    transformationLoading = false;
  };
</script>

<div class="stack stack-xs">
  <Select
    title="Create a buffer around"
    options={layerOptions}
    selected={transformation.layer.id}
    on:change={onLayerChange}
  />
  <div class="stack-h stack-h-2xs items-center">
    <FieldLabel fieldId="{transformation.id}-distance">Distance</FieldLabel>
    <NumberInput
      id="{transformation.id}-distance"
      value={transformation.settings.distance}
      on:change={onDistanceChange}
    />
    <Select
      options={unitOptions}
      selected={transformation.settings.units}
      on:change={onUnitChange}
    />
  </div>
  <div class="stack-h stack-h-2xs items-center">
    <FieldLabel fieldId="{transformation.id}-output">Output</FieldLabel>
    <TextInput
      value={transformation.output}
      on:change={onOutputChange}
      class="!border-transparent focus-within:!border-slate-600 hover:!border-slate-600"
    />
  </div>
  <Button
    on:click={onRun}
    class="self-end text-xs"
    loading={transformationLoading}>Run</Button
  >
</div>
