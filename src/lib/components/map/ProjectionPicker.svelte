<script lang="ts">
  import cs from 'classnames';

  import GlobeIcon from '$lib/components/icons/GlobeIcon.svelte';
  import { ir } from '$lib/stores/ir';
  import { map } from '$lib/stores/map';

  function onToggleGlobe() {
    const currentProjection = $map.getProjection();
    const nextProjection =
      currentProjection?.type === 'globe' ? 'mercator' : 'globe';

    $map.setProjection({
      type: nextProjection
    });
    ir.update((ir) => {
      ir.projection = nextProjection;
      return ir;
    });
  }
</script>

<div class="flex self-center">
  <div class="self-center">
    <span
      class={cs(
        'group relative flex h-6 w-10 items-center rounded-[6px] border border-slate-600 transition-colors',
        {
          'bg-slate-600 hover:bg-slate-700': $ir.projection === 'mercator',
          'border-white bg-ck hover:bg-ck-light': $ir.projection === 'globe'
        }
      )}
    >
      <span class="absolute inset-0 z-10 m-0 h-full w-full opacity-0">
        <input
          type="checkbox"
          class="absolute inset-0 z-10 m-0 h-full w-full opacity-0"
          onchange={onToggleGlobe}
        /></span
      >
      <div
        class="group-has[input:checked]:text-teal-300 flex h-[22px] w-[22px] translate-x-0 items-center justify-center rounded-[5px] bg-slate-400 text-white shadow transition-transform group-has-[input:checked]:translate-x-4"
      >
        <GlobeIcon />
      </div></span
    >
  </div>
</div>
