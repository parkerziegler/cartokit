<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  function click() {
    dispatch('click');
  }
</script>

<button
  on:click={click}
  class="text-white text-sm bg-slate-700 px-4 py-2 rounded {$$props.class}"
  ><slot /></button
>
