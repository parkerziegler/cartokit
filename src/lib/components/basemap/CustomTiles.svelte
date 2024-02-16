<script lang="ts">
  import { getContext } from 'svelte';
  import cs from 'classnames';
  import colors from 'tailwindcss/colors';
  import type { StyleSpecification } from 'maplibre-gl';

  import Button from '$lib/components/shared/Button.svelte';
  import CodeEditor from '$lib/components/shared/CodeEditor.svelte';
  import FieldLabel from '$lib/components/shared/FieldLabel.svelte';
  import TextInput from '$lib/components/shared/TextInput.svelte';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';
  import {
    switchBasemapWithPreservedLayers,
    type BasemapSwitchConfig
  } from '$lib/utils/maplibre';

  let tileUrl = '';
  let tileJSONSpec = '{}';
  let sourceSelection: 'url' | 'json' = 'url';

  $: applyDisabled =
    sourceSelection === 'url' ? !tileUrl : tileJSONSpec === '{}';

  const closeModal = getContext<() => void>('close-modal');

  const onTileUrlChange = (event: CustomEvent<{ value: string }>) => {
    tileUrl = event.detail.value;
  };

  const onTileUrlFocus = (event: CustomEvent<{ focusing: boolean }>) => {
    if (event.detail.focusing) {
      sourceSelection = 'url';
    }
  };

  const onTileJSONSpecChange = (doc: string) => {
    tileJSONSpec = doc;
  };

  const onTileJSONFocusChange = (focusing: boolean) => {
    if (focusing) {
      sourceSelection = 'json';
    }
  };

  const onApply = async () => {
    let url: string;
    let json: StyleSpecification | undefined;
    let config: BasemapSwitchConfig;

    if (sourceSelection === 'url') {
      url = tileUrl;
      json = undefined;
      config = { kind: 'url', url };
    } else {
      url = '';
      json = JSON.parse(tileJSONSpec) as StyleSpecification;
      config = { kind: 'json', json };
    }

    ir.update((ir) => {
      ir.basemap.url = url;
      ir.basemap.json = json;
      ir.basemap.provider = 'Custom';

      return ir;
    });

    await switchBasemapWithPreservedLayers($map, $ir, config);
    closeModal();
    tileUrl = '';
    tileJSONSpec = '{}';
  };
</script>

<div class="flex h-full flex-col">
  <div
    class={cs(
      'stack stack-xs basis-1/3 rounded-sm border border-transparent p-2 transition-colors',
      sourceSelection === 'url' && 'border-white bg-gray-700'
    )}
  >
    <p
      class="text-sm font-semibold"
      class:text-slate-400={sourceSelection !== 'url'}
    >
      Add Tiles from a URL
    </p>
    <FieldLabel fieldId="tile-url">Tile URL</FieldLabel>
    <TextInput
      on:change={onTileUrlChange}
      on:focus={onTileUrlFocus}
      value={tileUrl}
      placeholder=""
      id="tile-url"
      class="w-full"
    />
  </div>
  <svg
    width="500"
    height="50"
    viewBox="0 0 500 50"
    class="z-10 -my-4 h-auto w-full max-w-full shrink-0"
  >
    <circle
      cx="250"
      cy="25"
      r="24"
      stroke={colors.slate['400']}
      stroke-width="1"
      fill={colors.slate['900']}
    />
    <text
      x="250"
      y="25"
      text-anchor="middle"
      dominant-baseline="middle"
      fill={colors.slate['400']}>OR</text
    >
  </svg>
  <div
    class={cs(
      'stack stack-xs basis-2/3 overflow-hidden rounded-sm border border-transparent p-2 transition-colors',
      sourceSelection === 'json' && 'border-white bg-gray-700'
    )}
  >
    <p
      class="text-sm font-semibold"
      class:text-slate-400={sourceSelection !== 'json'}
    >
      Add Vector Tile JSON Specification
    </p>
    <CodeEditor
      doc={tileJSONSpec}
      config={{
        kind: 'editable',
        onChange: onTileJSONSpecChange,
        onFocusChange: onTileJSONFocusChange,
        language: 'json'
      }}
    />
  </div>
  <Button class="mt-2 self-end" on:click={onApply} disabled={applyDisabled}
    >Apply</Button
  >
</div>
