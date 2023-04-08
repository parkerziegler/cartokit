<script lang="ts">
  export let title: string;
</script>

<div class="stack stack-xs p-4 font-mono text-xs text-white">
  {#if $$slots.action}
    <div class="flex items-center justify-between">
      <p class="font-sans text-base font-medium tracking-wider">
        {title}
      </p>
      <slot name="action" />
    </div>
  {:else}
    <p class="font-sans text-base font-medium tracking-wider">
      {title}
    </p>
  {/if}
  <slot />
</div>
