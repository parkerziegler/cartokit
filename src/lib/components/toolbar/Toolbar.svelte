<script>
  import cs from 'classnames';

  import BasemapPicker from '$lib/components/map/BasemapPicker.svelte';
  import ProjectionPicker from '$lib/components/map/ProjectionPicker.svelte';
  import { layout } from '$lib/stores/layout';
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
  <div class="h-10 w-[1.5px] bg-slate-600"></div>
  <ProjectionPicker />
</div>
