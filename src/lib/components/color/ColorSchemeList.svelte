<script lang="ts">
  export let colors: readonly string[];
</script>

<ul class="flex">
  {#each colors as color}
    <li>
      <span style="background-color: {color};" class="block h-4 w-6" />
    </li>
  {/each}
</ul>
