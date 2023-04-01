<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  function click() {
    dispatch('click');
  }
</script>

<button
  on:click={click}
  class="rounded bg-slate-700 px-4 py-2 text-sm text-white {$$props.class}"
  ><slot /></button
>
