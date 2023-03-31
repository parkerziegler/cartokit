<script lang="ts">
  export let title: string;
</script>

<div class="flex stack stack-xs font-mono text-white text-xs p-4">
  {#if $$slots.action}
    <div class="flex items-center justify-between">
      <p class="text-base font-medium font-sans tracking-wider">{title}</p>
      <slot name="action" />
    </div>
  {:else}
    <p class="text-base font-medium font-sans tracking-wider">{title}</p>
  {/if}
  <slot />
</div>
