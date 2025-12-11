<script lang="ts">
  import type { Map } from 'maplibre-gl';

  import BasemapPicker from '$lib/components/map/BasemapPicker.svelte';
  import ProjectionPicker from '$lib/components/map/ProjectionPicker.svelte';
  import ChatButton from '$lib/components/chat/ChatButton.svelte';
  import { chat } from '$lib/state/chat.svelte';
  import { layout } from '$lib/stores/layout';

  interface Props {
    map: Map;
  }

  let { map }: Props = $props();
</script>

<div
  class={[
    'ease-cubic-out absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-slate-900 p-2 shadow-lg transition-transform duration-400',
    {
      '-translate-y-72': $layout.dataVisible,
      'translate-x-[calc(-16.666666vw-50%)]': $layout.editorVisible,
      'delay-150': !$layout.editorVisible
    }
  ]}
>
  <BasemapPicker {map} />
  <ProjectionPicker />
  {#if chat.enable}
    <ChatButton />
  {/if}
</div>
