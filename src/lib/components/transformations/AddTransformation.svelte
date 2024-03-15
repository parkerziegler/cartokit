<script lang="ts">
  import uniqueId from 'lodash.uniqueid';

  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import { ir } from '$lib/stores/ir';
  import { selectedLayer } from '$lib/stores/selected-layer';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';
  import type { UserTransformation } from '$lib/types/transformation';

  $: layer = $selectedLayer ?? (Object.values($ir.layers)[0] as CartoKitLayer);
  $: defaultTransformation = {
    id: uniqueId('transformation__'),
    type: 'Buffer',
    layer,
    settings: {
      distance: 1,
      units: 'mi'
    },
    output: `${layer.displayName} (Buffer)`
  } as UserTransformation;

  const onClick = () => {
    ir.update((ir) => {
      ir.transformations.push(defaultTransformation);

      return ir;
    });
  };
</script>

<Button class="flex items-center self-center" on:click={onClick}>
  <span class="mr-4">Add Transformation</span>
  <PlusIcon />
</Button>
