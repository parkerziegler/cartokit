<script lang="ts">
  import cs from 'classnames';
  import { getContext } from 'svelte';

  import BasemapPicker from '$lib/components/map/BasemapPicker.svelte';
  import ProjectionPicker from '$lib/components/map/ProjectionPicker.svelte';
  import ChatButton from '$lib/components/chat/ChatButton.svelte';
  import { layout } from '$lib/stores/layout';

  const enableChat = getContext<boolean>('enableChat');
</script>

<div
  class={cs(
    'absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-slate-900 p-2 shadow-lg transition-transform duration-[400ms] ease-out',
    {
      '-translate-y-72': $layout.dataVisible,
      'translate-x-[calc(-16.666666vw-50%)]': $layout.editorVisible
    }
  )}
>
  <BasemapPicker />
  <ProjectionPicker />
  {#if enableChat}
    <ChatButton />
  {/if}
</div>
