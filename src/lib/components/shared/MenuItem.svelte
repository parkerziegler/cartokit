<script lang="ts">
  import cs from 'classnames';

  export let title: string;
  export let titleClass = '';
</script>

<div class="stack stack-2xs p-4 font-mono text-xs text-white">
  {#if $$slots.action}
    <div class={cs('flex items-center justify-between', titleClass)}>
      <p class="font-sans text-sm font-medium tracking-wider">
        {title}
      </p>
      <slot name="action" />
    </div>
  {:else}
    <p class="font-sans text-sm font-medium tracking-wider">
      {title}
    </p>
  {/if}
  <slot />
</div>
