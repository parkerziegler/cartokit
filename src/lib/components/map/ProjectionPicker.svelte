<script lang="ts">
  import { onMount } from 'svelte';

  import { tooltip } from '$lib/attachments/tooltip';
  import GlobeIcon from '$lib/components/icons/GlobeIcon.svelte';
  import { ir } from '$lib/state/ir.svelte';
  import { map } from '$lib/state/map.svelte';
  import { registerKeybinding } from '$lib/utils/keybinding';

  onMount(() => {
    const unregisterKeybinding = registerKeybinding('g', onToggleGlobe);

    return unregisterKeybinding;
  });

  function onToggleGlobe() {
    const currentProjection = map.value!.getProjection();
    const nextProjection =
      currentProjection?.type === 'globe' ? 'mercator' : 'globe';

    map.value!.setProjection({
      type: nextProjection
    });
    ir.value.projection = nextProjection;
  }
</script>

<div
  class="flex self-center"
  {@attach tooltip({
    content: 'Globe',
    keybinding: 'G',
    offsetValue: 12
  })}
>
  <div class="self-center">
    <span
      class={[
        'group relative flex h-6 w-10 items-center rounded-[6px] border border-slate-600 transition-colors',
        {
          'bg-slate-600 hover:bg-slate-700': ir.value.projection === 'mercator',
          'bg-ck hover:bg-ck-light border-white':
            ir.value.projection === 'globe'
        }
      ]}
    >
      <span class="absolute inset-0 z-10 m-0 h-full w-full opacity-0">
        <input
          type="checkbox"
          class="absolute inset-0 z-10 m-0 h-full w-full opacity-0"
          onchange={onToggleGlobe}
        /></span
      >
      <div
        class={[
          'flex h-[22px] w-[22px] translate-x-0 items-center justify-center rounded-[5px] bg-slate-400 text-white shadow-sm transition-transform group-has-[input:checked]:translate-x-4',
          {
            'translate-x-4': ir.value.projection === 'globe'
          }
        ]}
      >
        <GlobeIcon />
      </div></span
    >
  </div>
</div>
