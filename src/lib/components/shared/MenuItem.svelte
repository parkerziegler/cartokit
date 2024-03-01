<script lang="ts">
  import cs from 'classnames';

  export let title: string;
  export let titleClass = '';
  export let containerClass = '';
</script>

<div
  class={cs('stack stack-xs p-4 font-mono text-xs text-white', containerClass)}
>
  {#if $$slots.action}
    <div class={cs('flex items-center justify-between', titleClass)}>
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
