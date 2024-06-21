<script lang="ts">
  import cs from 'classnames';

  let className = '';
  export { className as class };
</script>

{#if $$slots.action && $$slots.subtitle}
  <div class="stack stack-xs p-4 text-white">
    <div class="flex items-center justify-between">
      <p class={cs('font-sans text-lg font-medium tracking-wider', className)}>
        <slot />
      </p>
      <slot name="action" />
    </div>
    <slot name="subtitle" />
  </div>
{:else if $$slots.action}
  <div class="flex items-center justify-between p-4 text-white">
    <p class={cs('font-sans text-xl font-medium tracking-wider', className)}>
      <slot />
    </p>
    <slot name="action" />
  </div>
{:else}
  <p
    class={cs(
      'p-4 font-sans text-xl font-medium tracking-wider text-white',
      className
    )}
  >
    <slot />
  </p>
{/if}
